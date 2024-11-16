import { Cart } from './models/cartModel.js';
import { ProductsManager } from './ProductsDao.js';
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
    
            const existingProduct = cart.products.find(p => p.product.equals(productId));
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }
    
            await cart.save();
            return cart;
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
            const cart = await Cart.findByIdAndUpdate(cartId, { products: updatedProducts }, { new: true }).lean();
            if (!cart) {
                throw new Error('Cart not found');
            }
            return cart;
        } catch (error) {
            console.error("Error updating cart:", error);
            throw new Error("Error updating cart.");
        }
    }

    static async updateProductQuantity(cartId, productId, quantity) {
        if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('Invalid cart or product ID');
        }
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const productInCart = cart.products.find(p => p.product.equals(productId));
            if (!productInCart) {
                throw new Error('Product not found in cart');
            }

            productInCart.quantity = quantity;
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error updating product quantity:", error);
            throw new Error("Error updating product quantity.");
        }
    }

    static async deleteProductFromCart(cartId, productId) {
        if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('Invalid cart or product ID');
        }
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const productIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (productIndex === -1) {
                throw new Error('Product not found in cart');
            }

            cart.products.splice(productIndex, 1); 
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error removing product from cart:", error);
            throw new Error("Error removing product from cart.");
        }
    }

    static async deleteAllProducts(cartId) {
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            throw new Error("Invalid cart ID.");
        }
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error("Cart not found");
            }

            cart.products = []; 
            await cart.save(); 
            return cart;
        } catch (error) {
            console.error("Error removing all products from cart:", error);
            throw new Error("Error removing all products from cart.");
        }
    }
}