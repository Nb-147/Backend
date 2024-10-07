import { Cart } from './models/Cart.js';
import { ProductsManager } from './ProductsManager.js';

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
        try {
            for (const product of updatedProducts) {
                const existingProduct = await ProductsManager.getProductById(product.product);
                if (!existingProduct) {
                    throw new Error(`Product with ID ${product.product} does not exist.`);
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