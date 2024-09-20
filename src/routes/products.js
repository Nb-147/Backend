import { Router } from "express";
import { ProductsManager } from "../dao/ProductsManager.js";
import { uploader } from "../utils/uploader.js";
import { pidValidate } from "../middlewares/pidValidate.js";
import { io } from "../app.js";

export const productsRouter = Router();

productsRouter.get("/:pid", pidValidate, async (req, res) => {
    const { pid } = req.params;

    try {
        const product = await ProductsManager.getProductsById(pid);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

productsRouter.get("/", async (req, res) => {
    const { limit, page, sort, category } = req.query;

    const limitNumber = Number(limit);
    const pageNumber = Number(page);

    if (limit && isNaN(limitNumber)) {
        return res.status(400).json({ error: "Limit must be a valid number" });
    }
    if (page && isNaN(pageNumber)) {
        return res.status(400).json({ error: "Page must be a valid number" });
    }

    try {
        const products = await ProductsManager.getProducts(limitNumber || 10, pageNumber || 1, category, sort);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

productsRouter.put("/:pid", pidValidate, uploader.array("thumbnails", 3), async (req, res) => {
    const { pid } = req.params;
    const { price, stock, title, description, code, category } = req.body;

    if (!price || !stock || !title || !description || !code || !category) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber) || stockNumber < 0 || priceNumber <= 0) {
        return res.status(400).json({ error: "Price and stock must be valid numbers greater than 0" });
    }

    const productUpdated = {
        title,
        description,
        code,
        category,
        price: priceNumber,
        status: true,
        stock: stockNumber,
        thumbnails: req.files ? req.files.map((file) => file.path) : [],
    };

    try {
        await ProductsManager.updateProduct(productUpdated, pid);
        res.status(200).json({
            message: "Product updated",
            product: productUpdated,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

productsRouter.post("/", uploader.array("thumbnails", 3), async (req, res) => {
    const { price, stock, title, description, code, category } = req.body;

    if (!price || !stock || !title || !description || !code || !category) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber) || stockNumber < 0 || priceNumber <= 0) {
        return res.status(400).json({ error: "Price and stock must be valid numbers greater than 0" });
    }

    const newProduct = {
        title,
        description,
        code,
        category,
        price: priceNumber,
        status: true,
        stock: stockNumber,
        thumbnails: req.files ? req.files.map((file) => file.path) : [],
    };

    try {
        await ProductsManager.addProduct(newProduct);
        io.emit("addProduct", newProduct);
        res.status(201).json({ message: "Product created", product: newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});

productsRouter.delete("/:pid", pidValidate, async (req, res) => {
    const { pid } = req.params;

    try {
        await ProductsManager.deleteProduct(pid);
        io.emit("deleteProduct", pid);
        res.status(200).json({ message: "Product deleted", id: pid });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
});