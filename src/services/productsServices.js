import { ProductsManager } from '../dao/ProductsDao.js';
import { io } from '../app.js';

export const getProductById = async (pid) => {
    try {
        const product = await ProductsManager.getProductsById(pid);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw new Error(error.message);
    }
};

export const getAllProducts = async (limit, page, sort, category) => {
    const limitNumber = Number(limit);
    const pageNumber = Number(page);

    if (limit && isNaN(limitNumber)) {
        throw new Error('Limit must be a valid number');
    }
    if (page && isNaN(pageNumber)) {
        throw new Error('Page must be a valid number');
    }

    try {
        return await ProductsManager.getProducts(limitNumber || 10, pageNumber || 1, category, sort);
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
    }
};

export const updateProduct = async (pid, productData, files) => {
    const { price, stock, title, description, code, category } = productData;

    if (!price || !stock || !title || !description || !code || !category) {
        throw new Error('Missing required fields');
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber) || stockNumber < 0 || priceNumber <= 0) {
        throw new Error('Price and stock must be valid numbers greater than 0');
    }

    const productUpdated = {
        title,
        description,
        code,
        category,
        price: priceNumber,
        status: true,
        stock: stockNumber,
        thumbnails: files ? files.map((file) => file.path) : [],
    };

    try {
        return await ProductsManager.updateProduct(productUpdated, pid);
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error(error.message);
    }
};

export const createProduct = async (productData, files) => {
    const { price, stock, title, description, code, category } = productData;

    if (!price || !stock || !title || !description || !code || !category) {
        throw new Error('Missing required fields');
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber) || stockNumber < 0 || priceNumber <= 0) {
        throw new Error('Price and stock must be valid numbers greater than 0');
    }

    const newProduct = {
        title,
        description,
        code,
        category,
        price: priceNumber,
        status: true,
        stock: stockNumber,
        thumbnails: files ? files.map((file) => file.path) : [],
    };

    try {
        await ProductsManager.addProduct(newProduct);
        io.emit("addProduct", newProduct);
        return newProduct;
    } catch (error) {
        console.error("Error creating product:", error);
        throw new Error(error.message);
    }
};

export const deleteProduct = async (pid) => {
    try {
        await ProductsManager.deleteProduct(pid);
        io.emit("deleteProduct", pid);
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error(error.message);
    }
};
