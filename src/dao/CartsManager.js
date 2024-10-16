import { Cart } from './models/Cart.js';
import { ProductsManager } from './ProductsManager.js';
import mongoose from 'mongoose';

export class CartsManager {
    static async createCart() {
        try {
            const newCart = { products: [] };
            return await Cart.create(newCart);
        } catch (error) {
            console.error("Error creating cart:", error); 
            throw new Error("Error creating cart."); 
        }
    }

    static async getCartProducts(cartId) {
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            throw new Error("Invalid cart ID.");
        }
        try {
            const cart = await Cart.findById(cartId).populate("products.product").lean();
            if (!cart) {
                throw new Error("Cart not found."); 
            }
            return cart;
        } catch (error) {
            console.error("Error retrieving cart products:", error); 
            throw new Error("Error retrieving cart products."); 
        }
    }

    static async addProductToCart(cartId, productId) {
        if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('Invalid cart or product ID');
        }
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const product = await ProductsManager.getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            const existingProduct = cart.products.find(p => p.product.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            return await cart.save();
        } catch (error) {
            console.error("Error adding product to cart:", error);
            throw new Error("Error adding product to cart.");
        }
    }

    static async updateCart(cartId, updatedProducts) {
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            throw new Error("Invalid cart ID.");
        }
        try {
            const validationPromises = updatedProducts.map(product => ProductsManager.getProductById(product.product));
            const productsExistence = await Promise.all(validationPromises);

            for (const existingProduct of productsExistence) {
                if (!existingProduct) {
                    throw new Error("One or more products do not exist.");
                }
            }

            const cart = await Cart.findByIdAndUpdate(cartId, { products: updatedProducts }, { new: true });
            if (!cart) {
                throw new Error('Cart not found');
            }

            return cart;
        } catch (error) {
            console.error("Error updating cart:", error);
            throw new Error("Error updating cart.");
        }
    }
}