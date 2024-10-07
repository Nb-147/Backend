import { Router } from "express";
import { ProductsManager } from "../dao/ProductsManager.js";
import { CartsManager } from "../dao/CartsManager.js";

export const viewsRouter = Router();

viewsRouter.get("/cart", async (req, res) => {
    const cartId = "66ec63f1ce1a5bbd66a25528"; 
    try {
        const cartProducts = await CartsManager.getCartProducts(cartId);

        if (!cartProducts || !cartProducts.products) {
            return res.status(404).render("error", { error: "Cart not found" });
        }

        res.status(200).render("cart", {
            title: "Cart",
            products: cartProducts.products,
        });
    } catch (error) {
        console.error("Error loading cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

viewsRouter.get("/products", async (req, res) => {
    const cartId = "66ec63f1ce1a5bbd66a25528";
    try {
        if (!req.session.user) {
            return res.redirect('/?error=not_authenticated');
        }

        const products = await ProductsManager.getProducts();
        const cart = await CartsManager.getCartProducts(cartId);

        if (!products || !products.payload || !cart || !cart.products) {
            return res.status(404).render("error", { error: "Products or cart not found" });
        }

        let totalProducts = 0;

        cart.products.forEach(p => {
            totalProducts = totalProducts + p.quantity;
        });

        res.status(200).render("home", {
            title: "Home",
            products: products.payload,
            page: products.page || 1,
            totalPages: products.totalPages || 1,
            numCarts: totalProducts,
            user: req.session.user
        });
    } catch (error) {
        console.error("Error loading products and cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/?error=not_authenticated');
        }

        const products = await ProductsManager.getProducts();

        if (!products || !products.payload) {
            return res.status(404).render("error", { error: "Products not found" });
        }

        res.status(200).render("realTimeProducts", {
            title: "Real Time Products",
            products: products.payload,
        });
    } catch (error) {
        console.error("Error loading real-time products:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

viewsRouter.get('/', (req, res) => {
    const error = req.session.error;
    const mensaje = req.query.mensaje || null;
    req.session.error = null; 
    res.render('login', { error, mensaje });
});

viewsRouter.get('/register', (req, res) => {
    res.render('register');
});