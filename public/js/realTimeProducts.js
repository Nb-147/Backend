const socket = io();

if (window.location.pathname === '/realTimeProducts') {
    socket.emit("message", "Real time products connected!"); 
}

const containerProducts = document.getElementById("container-products");
const productsForm = document.getElementById("products-form");
let currentPage = 1;
let totalPages = 1;
const limit = 10; 

const renderProducts = (products) => {
    containerProducts.innerHTML = products.map(product => `
        <div class="card-product">
            <header class="card-header">            
                <div class="img-container">
                    <img src=${""} alt="Product image"> 
                </div>
            </header>
            <div class="card-content">
                <h3 class="title-product">${product.title}</h3>
                <p class="description-product">${product.description}</p>
                <p class="price-product">$${product.price}</p>
            </div>
            <footer class="card-footer">
                <button class="btn-delete" data-id="${product.id}">Delete</button>
            </footer>
        </div>
    `).join('');
};

const fetchProducts = async (page = 1) => {
    try {
        const response = await fetch(`/api/products?limit=${limit}&page=${page}`);
        const data = await response.json();
        renderProducts(data.products);
        totalPages = data.totalPages;
        currentPage = data.page;

        document.getElementById('pagination-controls').innerHTML = `
            <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
        `;
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

fetchProducts();

document.getElementById('pagination-controls').addEventListener('click', (e) => {
    if (e.target.id === 'prev-page' && currentPage > 1) {
        fetchProducts(currentPage - 1);
    } else if (e.target.id === 'next-page' && currentPage < totalPages) {
        fetchProducts(currentPage + 1);
    }
});

socket.on("addProduct", (data) => {
    if (!data || !data.title || !data.description || !data.price || !data.id) {
        console.error("Invalid product data", data); 
        return;
    }

    fetchProducts(currentPage); 
});

socket.on("deleteProduct", (id) => {
    const productElement = document.querySelector(`[data-id="${id}"]`);
    if (productElement) {
        productElement.closest(".card-product").remove();
        fetchProducts(currentPage); 
    } else {
        console.error("Product not found for deletion", id); 
    }
});

productsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
        const formData = new FormData(productsForm);
        const response = await fetch("/api/products", {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error("Error creating product"); 
        }
        
        console.log('Product successfully created'); 
        fetchProducts(currentPage); 
    } catch (error) {
        console.error("Error submitting form:", error); 
    }
});

containerProducts.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
        const id = e.target.dataset.id;
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            
            if (!response.ok) {
                throw new Error("Error deleting product"); 
            }

            console.log(`Product with ID ${id} deleted`); 
            fetchProducts(currentPage); 
        } catch (error) {
            console.error("Error deleting product:", error); 
        }
    }
});