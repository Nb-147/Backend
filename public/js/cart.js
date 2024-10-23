const cartPrice = document.getElementById("cart-price");
const cleanCart = document.getElementById("clean-cart");
const cartContainer = document.getElementById("cart-container");

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
        const res = await fetch(`/api/carts`);
        const data = await res.json();
        if (data.products.length === 0) {
            cartContainer.innerHTML = "<h1>There are no products in the cart</h1>"; 
        } else {
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
        const res = await fetch(`/api/carts`, {
            method: "DELETE",
        });
        if (res.ok) {
            socket.emit("cartUpdated", {}); 
            getCartProducts(); 
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

function updateCartUI(cart) {
    cartContainer.innerHTML = ''; 
    cart.products.forEach(product => {
        cartContainer.innerHTML += 
            `<div class="cart-item">
                <p>${product.product.title}</p>
                <p>Quantity: ${product.quantity}</p>
            </div>`;
    });
}
