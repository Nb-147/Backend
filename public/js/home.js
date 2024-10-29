const containerHome = document.getElementById("container-home");
const applyFilter = document.getElementById("apply-filter");
const searchButton = document.getElementById("search-button");
const currentPage = document.getElementById("current-page");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const cartView = document.getElementById("cart-view");
const searchTitle = document.getElementById("search-title");
const categoryFilter = document.getElementById("category-filter");
const priceFilter = document.getElementById("price-filter");

let maxPage;
let currentPageNumber;
let userCartId;

const getProducts = async (filters = {}) => {
    try {
        const params = new URLSearchParams(location.search);
        let page = params.get("page") || 1;

        let query = `/api/products/?page=${page}`;

        if (filters.title || params.get("title")) {
            const title = filters.title || params.get("title");
            query += `&title=${title}`;
            searchTitle.value = title;
        }

        if (filters.category || params.get("category")) {
            const category = filters.category || params.get("category");
            query += `&category=${category}`;
            categoryFilter.value = category;
        }

        if (filters.sort || params.get("sort")) {
            const sort = filters.sort || params.get("sort");
            query += `&sort=${sort}`;
            priceFilter.value = sort;
        }

        const res = await fetch(query);

        if (!res.ok) {
            throw new Error(`Error fetching products: ${res.statusText}`);
        }

        const data = await res.json();
        maxPage = data.totalPages;
        currentPageNumber = data.page;

        containerHome.innerHTML = "";

        containerHome.innerHTML += data.payload
            .map(
                (prod) => `
                <div class="card-product">
                    <header class="card-header">
                        <div class="img-container">
                            ${prod.thumbnails.map(
                                (thumbnail) => `<img src="${thumbnail}" alt="Product image">`
                            ).join('')}
                        </div>
                    </header>
                    <div class="card-content">
                        <h3 class="title-product">${prod.title}</h3>
                        <p class="description-product">${prod.description}</p>
                        <p class="price-product">U$S ${prod.price}</p>
                    </div>
                    <footer class="card-footer">
                        <button class="btn-addToCart" data-id="${prod._id}">Add to cart</button>
                    </footer>
                </div>
            `
            ).join("");

        updatePaginationButtons();
    } catch (err) {
        console.error("Error loading products:", err);
    }
};

const updatePaginationButtons = () => {
    currentPage.textContent = currentPageNumber;

    btnNext.disabled = currentPageNumber >= maxPage;
    btnPrev.disabled = currentPageNumber <= 1;
};

const params = new URLSearchParams(location.search);
let page = Number(params.get('page')) || 1;

getProducts();

const getUserCartId = async () => {
    try {
        const res = await fetch('/api/sessions/current');
        if (!res.ok) {
            throw new Error('Error fetching user cart');
        }
        const data = await res.json();
        userCartId = data.user.cart;
        await updateHomeCartUI();
    } catch (err) {
        console.error('Error fetching user cart:', err);
    }
};

getUserCartId();

btnNext.addEventListener('click', () => {
    if (currentPageNumber < maxPage) {
        page++;
        applyFiltersWithPage(page);
    }
});

btnPrev.addEventListener('click', () => {
    if (currentPageNumber > 1) {
        page--;
        applyFiltersWithPage(page);
    }
});

cartView.addEventListener("click", () => {
    location.href = `/cart`;
});

// Lógica para ejecutar la búsqueda al hacer clic en el botón "Search"
searchButton.addEventListener("click", () => {
    const title = searchTitle.value.trim();
    applyFiltersWithPage(1, { title });
});

const applyFiltersWithPage = (page, filters = {}) => {
    const title = filters.title || searchTitle.value.trim();
    const category = categoryFilter.value;
    const sort = priceFilter.value;

    let query = `/products?page=${page}`;
    if (title) query += `&title=${title}`;
    if (category) query += `&category=${category}`;
    if (sort) query += `&sort=${sort}`;

    location.href = query;
};

const updateHomeCartUI = async () => {
    try {
        if (!userCartId) return;
        const res = await fetch(`/api/carts/${userCartId}`);
        const data = await res.json();

        const cartContainer = document.getElementById("cart-count");

        let totalProducts = 0;
        data.products.forEach(p => {
            totalProducts += p.quantity;
        });

        cartContainer.innerHTML = totalProducts;

    } catch (err) {
        console.error("Error fetching cart:", err);
    }
};

containerHome.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-addToCart")) {
        const id = e.target.dataset.id;

        try {
            if (!userCartId) return;
            const res = await fetch(`/api/carts/${userCartId}/products/${id}`, {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error(`Error adding product to cart: ${res.statusText}`);
            }

            await updateHomeCartUI();
        } catch (err) {
            console.error("Error adding product to cart:", err);
        }
    }
});

applyFilter.addEventListener("click", () => {
    applyFiltersWithPage(1);
});
