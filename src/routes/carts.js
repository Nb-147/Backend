import Router from 'express';
import { CartsManager } from '../dao/CartsManager.js';
import { isValidObjectId } from "mongoose";
import { authenticateJWT } from '../middlewares/authJWT.js'; 
import { io } from '../app.js';

export const cartsRouter = Router();

cartsRouter.get("/:cid", authenticateJWT, async (req, res) => {
    const { cid } = req.params;

    if (!cid) return res.status(400).json({ error: "Cart ID not provided" });
    if (!isValidObjectId(cid)) return res.status(400).json({ message: "Invalid cart ID" });

    try {
        const products = await CartsManager.getCartProducts(cid);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching cart products:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.get("/", authenticateJWT, async (req, res) => {
    try {
        const cartId = req.user.cart; 
        if (!cartId || !isValidObjectId(cartId)) {
            return res.status(400).json({ error: "Invalid cart ID for the logged-in user" });
        }

        const products = await CartsManager.getCartProducts(cartId);

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching cart products:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.put("/:cid", authenticateJWT, async (req, res) => {
    const { cid } = req.params;
    const products = req.body;

    if (!cid || !products) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    if (!isValidObjectId(cid)) return res.status(400).json({ message: "Invalid cart ID" });

    try {
        await CartsManager.updateAllCart(cid, products);
        io.emit('cartUpdated', updatedCart);
        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.put("/:cid/products/:pid", authenticateJWT, async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!cid || !pid || !quantity) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "Invalid cart or product ID" });
    }

    const quantityNumber = Number(quantity);
    if (isNaN(quantityNumber)) return res.status(400).json({ error: "Quantity must be a valid number" });

    try {
        await CartsManager.updateProductQuantity(cid, pid, quantityNumber);
        res.status(200).json({ message: "Product quantity updated successfully" });
    } catch (error) {
        console.error("Error updating product quantity:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.post("/", authenticateJWT, async (req, res) => {
    try {
        const cart = await CartsManager.createCart();
        res.status(201).json({ message: "Cart created", cart });
    } catch (error) {
        console.error("Error creating cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.post("/:cid/products/:pid", authenticateJWT, async (req, res) => {
    const { cid, pid } = req.params; 
    const userCart = req.user.cart; 

    if (userCart !== cid) {
        return res.status(403).json({ error: "You are not allowed to modify this cart" });
    }

    if (!cid || !pid) {
        return res.status(400).json({ error: "Missing cart or product ID" });
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "Invalid cart or product ID" });
    }

    try {
        await CartsManager.addProductToCart(cid, pid); 
        res.status(200).json({ message: "Product added to cart successfully" });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.delete("/:pid", authenticateJWT, async (req, res) => {
    const { pid } = req.params;
    const userCart = req.user.cart; 

    if (!userCart || !pid) {
        return res.status(400).json({ error: "Missing cart or product ID" });
    }

    if (!isValidObjectId(userCart) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "Invalid cart or product ID" });
    }

    try {
        await CartsManager.deleteProductFromCart(userCart, pid);
        io.emit('cartUpdated', updatedCart);
        res.status(200).json({ message: "Product removed from cart successfully" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.delete("/", authenticateJWT, async (req, res) => {
    const userCart = req.user.cart; 

    if (!userCart) {
        return res.status(400).json({ error: "Cart ID not provided" });
    }

    if (!isValidObjectId(userCart)) return res.status(400).json({ message: "Invalid cart ID" });

    try {
        await CartsManager.deleteAllProducts(userCart);
        res.status(200).json({ message: "All products have been removed from the cart" });
    } catch (error) {
        console.error("Error removing all products from cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});