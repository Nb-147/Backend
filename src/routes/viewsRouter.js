import { Router } from "express";
import { ProductsManager } from "../dao/ProductsManager.js";
import { CartsManager } from "../dao/CartsManager.js";
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const viewsRouter = Router();

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/?error=not_authenticated");
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect("/?error=not_authenticated");
    }
    req.user = user;
    next();
  });
};

viewsRouter.get("/cart", authenticateJWT, async (req, res) => {
  const cartId = req.user.cart || "66ec63f1ce1a5bbd66a25528"; 
  try {
    const cartProducts = await CartsManager.getCartProducts(cartId);

    if (!cartProducts || !cartProducts.products) {
      return res.status(404).render("error", { error: "Cart not found" });
    }

    res.status(200).render("cart", {
      title: "Cart",
      products: cartProducts.products,
      user: req.user, 
    });
  } catch (error) {
    console.error("Error loading cart:", error);
    res.status(500).render("error", {
      error: "Server error",
      detail: error.message,
    });
  }
});

viewsRouter.get("/products", authenticateJWT, async (req, res) => {
  const cartId = req.user.cart || "66ec63f1ce1a5bbd66a25528"; 
  try {
    const products = await ProductsManager.getProducts();
    const cart = await CartsManager.getCartProducts(cartId);

    if (!products || !products.payload || !cart || !cart.products) {
      return res.status(404).render("error", { error: "Products or cart not found" });
    }

    let totalProducts = 0;
    cart.products.forEach((p) => {
      totalProducts += p.quantity;
    });

    res.status(200).render("home", {
      title: "Home",
      products: products.payload,
      page: products.page || 1,
      totalPages: products.totalPages || 1,
      numCarts: totalProducts,
      user: req.user, 
    });
  } catch (error) {
    console.error("Error loading products and cart:", error);
    res.status(500).render("error", {
      error: "Server error",
      detail: error.message,
    });
  }
});

viewsRouter.get("/realtimeproducts", authenticateJWT, async (req, res) => {
  try {
    const products = await ProductsManager.getProducts();

    if (!products || !products.payload) {
      return res.status(404).render("error", { error: "Products not found" });
    }

    res.status(200).render("realTimeProducts", {
      title: "Real Time Products",
      products: products.payload,
      user: req.user, 
    });
  } catch (error) {
    console.error("Error loading real-time products:", error);
    res.status(500).render("error", {
      error: "Server error",
      detail: error.message,
    });
  }
});

viewsRouter.get("/", (req, res) => {
  const error = req.query.error || null; 
  const mensaje = req.query.mensaje || null;
  res.render("login", { error, mensaje });
});

viewsRouter.get("/register", (req, res) => {
  res.render("register");
});

export default viewsRouter;
