import * as productsService from '../services/productsServices.js';


const getProductById = async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productsService.getProductById(pid);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const getAllProducts = async (req, res) => {
    const { limit, page, sort, category } = req.query;
    try {
        const products = await productsService.getAllProducts(limit, page, sort, category);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const updateProduct = async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productsService.updateProduct(pid, req.body, req.files);
        res.status(200).json({
            message: "Product updated",
            product,
        });
    } catch (error) {
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const newProduct = await productsService.createProduct(req.body, req.files);
        res.status(201).json({
            message: "Product created",
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    const { pid } = req.params;
    try {
        await productsService.deleteProduct(pid);
        res.status(200).json({ message: "Product deleted", id: pid });
    } catch (error) {
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

export default {
    getProductById,
    getAllProducts,
    updateProduct,
    createProduct,
    deleteProduct
};