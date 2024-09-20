import { Product } from './models/Product.js';

export class ProductsManager {
    static async getProducts(limit = 10, page = 1, query, sort) {
        try {

            const filter = query
                ? { category: { $regex: new RegExp(query, 'i') } }
                : {};

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
        try {
            const product = await Product.findById(productId).lean();
            if (!product) throw new Error("Product not found.");
            return product;
        } catch (error) {
            console.error("Error fetching product:", error);
            throw new Error("Error fetching product by ID.");
        }
    }

    static async addProduct(newProduct) {
        try {
            await Product.create(newProduct);
        } catch (error) {
            console.error("Error adding product:", error);
            throw new Error("Could not add product.");
        }
    }

    static async deleteProduct(productId) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(productId);
            if (!deletedProduct) throw new Error("Product not found.");
        } catch (error) {
            console.error("Error deleting product:", error);
            throw new Error("Could not delete product.");
        }
    }

    static async updateProduct(updatedProduct, productId) {
        try {
            const result = await Product.findByIdAndUpdate(
                productId,
                updatedProduct,
                { new: true }
            );
            if (!result) throw new Error("Product not found for update.");
        } catch (error) {
            console.error("Error updating product:", error);
            throw new Error("Could not update product.");
        }
    }
}