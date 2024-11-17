const socket = io();

if (window.location.pathname === '/realTimeProducts') {
    socket.emit("message", "Real time products connected!");
}

const containerProducts = document.getElementById("container-products");
const productsForm = document.getElementById("products-form");
const paginationControls = document.getElementById("pagination-controls");
let currentPage = 1;
let totalPages = 1;
const limit = 10;

const renderProducts = (products) => {
    if (!products || products.length === 0) {
        containerProducts.innerHTML = "<p>No products found.</p>";
        return;
    }

    containerProducts.innerHTML = products.map(product => `
        <div class="card-product">
            <header class="card-header">
                <div class="img-container">
                    <img src="${product.thumbnails?.[0] || "/default-image.jpg"}" alt="Product image">
                </div>
            </header>
            <div class="card-content">
                <h3 class="title-product">${product.title}</h3>
                <p class="description-product">${product.description}</p>
                <p class="price-product">$${product.price}</p>
            </div>
            <footer class="card-footer">
                <button class="btn-delete" data-id="${product._id}">Delete</button>
            </footer>
        </div>
    `).join('');
};

const updatePaginationControls = () => {
    paginationControls.innerHTML = `
        <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${currentPage} de ${totalPages}</span>
        <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
    `;

    document.getElementById('prev-page')?.addEventListener('click', () => {
        if (currentPage > 1) fetchProducts(currentPage - 1);
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
        if (currentPage < totalPages) fetchProducts(currentPage + 1);
    });
};

const fetchProducts = async (page = 1) => {
    try {
        const response = await fetch(`/api/products?limit=${limit}&page=${page}`);
        const data = await response.json();

        if (data.status !== "success" || !Array.isArray(data.payload)) {
            throw new Error("Invalid response format");
        }

        renderProducts(data.payload);
        totalPages = data.totalPages;
        currentPage = data.page;

        updatePaginationControls();
    } catch (error) {
        console.error("Error fetching products:", error);
        containerProducts.innerHTML = "<p>Error loading products. Please try again later.</p>";
    }
};

fetchProducts(currentPage);

socket.on("addProduct", () => {
    fetchProducts(currentPage);
});

socket.on("deleteProduct", () => {
    fetchProducts(currentPage);
});

productsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(productsForm);

    const requiredFields = ["title", "description", "price", "stock", "code", "category"];
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            alert(`Please fill in the required field: ${field}`);
            return;
        }
    }

    for (let [key, value] of formData.entries()) {
    }

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Server response error:", errorResponse);
            throw new Error("Error creating product");
        }

        fetchProducts(currentPage);
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to create product. Please try again.");
    }
});


containerProducts.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
        const id = e.target.dataset.id;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Error deleting product");

            fetchProducts(currentPage);
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    }
});
