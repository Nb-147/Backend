const cartPrice = document.getElementById("cart-price");
const cleanCart = document.getElementById("clean-cart");
const backToHome = document.getElementById("back-home");
const removeItem = document.getElementById("remove-item");  
const cartContainer = document.getElementById("cart-container"); 

const CART = "66ec63f1ce1a5bbd66a25528"; 

const socket = io();

socket.on("cartUpdated", (updatedCart) => {
    updateCartUI(updatedCart);
});

const getCartProducts = async () => {
    try {
        const res = await fetch(`/api/carts/${CART}`);
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
    await fetch(`/api/carts/${CART}`, {
        method: "DELETE",
    });
});

backToHome.addEventListener("click", () => {
    location.href = "/products";
});

cartContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-item")) {
        const id = e.target.dataset.id;
        await fetch(`/api/carts/${CART}/products/${id}`, {
            method: "DELETE",
        });
        e.target.closest(".cart-item").remove(document.getElementById(id))
    }
    if (e.target.classList.contains("btn-increase")) {
        const quantity = e.target.previousElementSibling;
        quantity.innerHTML = parseInt(quantity.textContent) + 1;
        console.log(parseInt(quantity.textContent) + 1)
        updateQuantity(e.target.dataset.id, parseInt(quantity.textContent));
    }

    if (e.target.classList.contains("btn-decrease")) {
        const quantity = e.target.nextElementSibling;
        if (quantity.textContent <= 1) {
            return;
        }
        quantity.innerHTML = parseInt(quantity.textContent) - 1;
        updateQuantity(e.target.dataset.id, parseInt(quantity.textContent));
    }
});

const updateQuantity = async (id, quantity) => {
    await fetch(`/api/carts/${CART}/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
    });
};

function updateCartUI(cart) {
    cartContainer.innerHTML = ''; 
    cart.products.forEach(product => {
        cartContainer.innerHTML += `
            <div class="cart-item">
                <p>${product.product.title}</p>
                <p>Quantity: ${product.quantity}</p>
            </div>`;
    });
}