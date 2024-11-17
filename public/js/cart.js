const cartPrice = document.getElementById("cart-price");
const cleanCart = document.getElementById("clean-cart");
const cartContainer = document.getElementById("cart-container");
const buyNowButton = document.getElementById("buy-now");

const socket = io();

socket.on("cartUpdated", (updatedCart) => {
    updateCartUI(updatedCart);
});

const getUserCartId = async () => {
    try {
        const res = await fetch('/api/sessions/current');
        if (!res.ok) {
            throw new Error('Error fetching user cart');
        }
        const data = await res.json();
        return data.user.cart; 
    } catch (err) {
        console.error('Error fetching user cart:', err);
    }
};

const getCartProducts = async () => {
    try {
        const userCartId = await getUserCartId(); 
        if (!userCartId) throw new Error('No cartId found');

        const res = await fetch(`/api/carts/${userCartId}`);
        const data = await res.json();
        if (data.products.length === 0) {
            cartContainer.innerHTML = "<h1>There are no products in the cart</h1>"; 
        } else {
            cartContainer.innerHTML = ""; 
            data.products.forEach((product) => {
                cartContainer.innerHTML += `
                    <div class="cart-item">
                        <img src=${product.product.thumbnails} alt="Producto" class="product-image">
                        <div class="product-details">
                            <h3>${product.product.title}</h3>
                            <p>U$S ${product.product.price}</p>
                            <div class="quantity-controls">
                                <button class="btn-decrease" data-id=${product.product._id}>-</button>
                                <span class="quantity">${product.quantity}</span>
                                <button class="btn-increase" data-id=${product.product._id}>+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-id=${product.product._id}>Delete</button>
                    </div>
                `;
            });

            cartPrice.innerHTML = data.products.reduce((acc, item) => {
                if (item.product && item.product.price) {
                    return acc + item.product.price * item.quantity;
                }
                return acc; 
            }, 0);
        }
    } catch (err) {
        console.log(err);
    }
};
getCartProducts(); 

cleanCart.addEventListener("click", async () => {
    try {
        const userCartId = await getUserCartId(); 
        if (!userCartId) throw new Error('No cartId found');

        const res = await fetch(`/api/carts/${userCartId}`, {
            method: "DELETE",
        });
        if (res.ok) {
            socket.emit("cartUpdated", {}); 
            getCartProducts(); 

            cartPrice.innerHTML = '0'; 
        }
    } catch (err) {
        console.log("Error clearing cart:", err);
    }
});

cartContainer.addEventListener("click", async (e) => {
    const productId = e.target.dataset.id;

    if (e.target.classList.contains("btn-increase")) {
        const quantity = e.target.previousElementSibling;
        await updateQuantity(productId, parseInt(quantity.textContent) + 1); 
        getCartProducts(); 
    }

    if (e.target.classList.contains("btn-decrease")) {
        const quantity = e.target.nextElementSibling;
        if (parseInt(quantity.textContent) > 1) {
            await updateQuantity(productId, parseInt(quantity.textContent) - 1); 
            getCartProducts(); 
        }
    }

    if (e.target.classList.contains("remove-item")) {
        await deleteProductFromCart(productId);
        getCartProducts(); 
    }
});

const updateQuantity = async (productId, quantity) => {
    try {
        const userCartId = await getUserCartId(); 
        if (!userCartId) throw new Error('No cartId found');

        const res = await fetch(`/api/carts/${userCartId}/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity }),
        });

        if (!res.ok) {
            throw new Error(`Failed to update product quantity`);
        }
        socket.emit("cartUpdated", {}); 
    } catch (error) {
        console.error("Error updating product quantity:", error);
    }
};

const deleteProductFromCart = async (productId) => {
    try {
        const userCartId = await getUserCartId();
        if (!userCartId) throw new Error('No cartId found');

        const res = await fetch(`/api/carts/${userCartId}/products/${productId}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            throw new Error("Error removing product from cart.");
        }

        socket.emit("cartUpdated", {}); 
    } catch (err) {
        console.error("Error removing product from cart:", err);
    }
};

const updateCartUI = (cart) => {
    cartContainer.innerHTML = ''; 
    let totalPrice = 0;

    cart.products.forEach(product => {
        const { product: prodDetails, quantity } = product;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="${prodDetails.thumbnails}" alt="Producto" class="product-image">
                <div class="product-details">
                    <h3>${prodDetails.title}</h3>
                    <p>U$S ${prodDetails.price}</p>
                    <div class="quantity-controls">
                        <button class="btn-decrease" data-id="${prodDetails._id}">-</button>
                        <span class="quantity">${quantity}</span>
                        <button class="btn-increase" data-id="${prodDetails._id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${prodDetails._id}">Delete</button>
            </div>
        `;

        totalPrice += prodDetails.price * quantity;
    });

    document.getElementById('cart-price').textContent = totalPrice.toFixed(2);
};

buyNowButton.addEventListener("click", async () => {
    try {
        const userCartId = await getUserCartId();
        if (!userCartId) throw new Error('No cartId found');

        const response = await fetch(`/api/carts/${userCartId}`);
        if (!response.ok) throw new Error('Failed to fetch cart products');

        const cart = await response.json();
        if (!cart.products || cart.products.length === 0) {
            alert('Your cart is empty. Add products before proceeding to checkout.');
            return;
        }

        await purchaseCart();
    } catch (error) {
        console.error('Error while buying cart:', error);
    }
});

async function purchaseCart() {
    try {
        const userCartId = await getUserCartId();
        if (!userCartId) throw new Error('No cartId found');

        const response = await fetch(`/api/carts/${userCartId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            console.error("Error parsing JSON:", error);
            throw new Error("Invalid JSON response from server");
        }

        if (response.ok) {
            if (result.productsNotPurchased && result.productsNotPurchased.length > 0) {
                let message = "Purchase completed, but the following items were not bought due to insufficient stock:\n";
                result.productsNotPurchased.forEach((item) => {
                    const productId = item.product._id || item.product;
                    const reason = item.reason || 'Unknown reason';
                    message += `- Product ID: ${productId} (Reason: ${reason})\n`;
                });
                alert(message);
            } else {
                alert("Purchase completed successfully!");
            }

            if (result.ticket && result.ticket._id) {
                window.location.href = `/cart/purchase/${result.ticket._id}`;
            } else {
                console.error("Error: Ticket ID not found in the response");
                alert("Purchase completed but ticket not found.");
            }
        } else {
            alert(result.error || 'Purchase failed');
        }
    } catch (error) {
        console.error('Error during purchase:', error);
        alert('An error occurred while processing your purchase.');
    }
}