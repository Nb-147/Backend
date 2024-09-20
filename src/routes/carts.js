import Router from 'express';
import { CartsManager } from '../dao/CartsManager.js';
import { isValidObjectId } from "mongoose";

export const cartsRouter = Router();

cartsRouter.get("/:cid", async (req, res) => {
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

cartsRouter.get("/", async (req, res) => {

    const cartId = "66ec63f1ce1a5bbd66a25528"; 
    const products = await CartsManager.getCartProducts(cartId);

    try {
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching cart products:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const products = req.body;

    if (!cid || !products) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    if (!isValidObjectId(cid)) return res.status(400).json({ message: "Invalid cart ID" });

    try {
        await CartsManager.updateAllCart(cid, products);
        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.put("/:cid/products/:pid", async (req, res) => {
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

cartsRouter.post("/", async (req, res) => {
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

cartsRouter.post("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    if (!cid || !pid) {
        return res.status(400).json({ error: "Missing required parameters" });
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

cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    if (!cid || !pid) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ message: "Invalid cart or product ID" });
    }

    try {
        await CartsManager.deleteProductFromCart(cid, pid);
        res.status(200).json({ message: "Product removed from cart successfully" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

cartsRouter.delete("/:cid", async (req, res) => {
    const { cid } = req.params;

    if (!cid) {
        return res.status(400).json({ error: "Cart ID not provided" });
    }

    if (!isValidObjectId(cid)) return res.status(400).json({ message: "Invalid cart ID" });

    try {
        await CartsManager.deleteAllProducts(cid);
        res.status(200).json({ message: "All products have been removed from the cart" });
    } catch (error) {
        console.error("Error removing all products from cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});