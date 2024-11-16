import { Product } from './models/productModel.js';
import mongoose from 'mongoose';

export class ProductsManager {
    static async getProducts(limit = 10, page = 1, query, sort) {
        try {
            const filter = query ? { category: { $regex: new RegExp(query, 'i') } } : {};
            const sorting = sort ? { price: sort === "asc" ? 1 : -1 } : {};

            const response = await Product.paginate(filter, {
                lean: true,
                limit,
                page,
                sort: sorting,
            });

            return {
                status: response ? "success" : "error",
                payload: response.docs,
                totalPages: response.totalPages,
                prevPage: response.prevPage,
                nextPage: response.nextPage,
                page: response.page,
            };
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("Error fetching products.");
        }
    }

    static async getProductById(productId) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error("Invalid product ID.");
        }
        try {
            return await Product.findById(productId).lean();
        } catch (error) {
            console.error("Error retrieving product:", error);
            return null;
        }
    }

    static async addProduct(productData) {
        try {
            return await Product.create(productData);
        } catch (error) {
            console.error("Error adding product:", error);
            throw new Error("Error adding product.");
        }
    }

    static async updateProduct(productId, productData) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error("Invalid product ID.");
        }
        try {
            return await Product.findByIdAndUpdate(productId, productData, { new: true, lean: true });
        } catch (error) {
            console.error("Error updating product:", error);
            throw new Error("Error updating product.");
        }
    }

    static async deleteProduct(productId) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error("Invalid product ID.");
        }
        try {
            return await Product.findByIdAndDelete(productId);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw new Error("Error deleting product.");
        }
    }
}