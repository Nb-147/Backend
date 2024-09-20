import { Cart } from './models/Cart.js';

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
            const existingProduct = await Cart.findOne({
                _id: cartId,
                "products.product": productId,
            });

            if (existingProduct) {
                await Cart.updateOne(
                    { _id: cartId, "products.product": productId },
                    { $inc: { "products.$.quantity": 1 } }
                );
            } else {
                await Cart.updateOne(
                    { _id: cartId },
                    { $push: { products: { product: productId, quantity: 1 } } }
                );
            }
        } catch (error) {
            console.error("Error adding product to cart:", error); 
            throw new Error("Error adding product to cart."); 
        }
    }

    static async deleteProductFromCart(cartId, productId) {
        try {
            await Cart.updateOne(
                { _id: cartId },
                { $pull: { products: { product: productId } } }
            );
        } catch (error) {
            console.error("Error removing product from cart:", error); 
            throw new Error("Error removing product from cart."); 
        }
    }

    static async deleteAllProducts(cartId) {
        try {
            await Cart.updateOne(
                { _id: cartId },
                { $set: { products: [] } }
            );
        } catch (error) {
            console.error("Error removing all products from cart:", error); 
            throw new Error("Error removing all products from cart."); 
        }
    }

    static async updateAllCart(cartId, products) {
        try {
            await Cart.updateOne(
                { _id: cartId },
                { $set: { products } }
            );
        } catch (error) {
            console.error("Error updating cart:", error); 
            throw new Error("Error updating cart."); 
        }
    }

    static async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity < 0) {
                throw new Error("Quantity cannot be negative."); 
            }
            await Cart.updateOne(
                { _id: cartId, "products.product": productId },
                { $set: { "products.$.quantity": quantity } }
            );
        } catch (error) {
            console.error("Error updating product quantity in cart:", error); 
            throw new Error("Error updating product quantity in cart."); 
        }
    }
}