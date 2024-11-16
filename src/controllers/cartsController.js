import { isValidObjectId } from "mongoose";
import { CartsManager } from "../dao/CartsDao.js";
import Ticket from "../dao/models/ticketModel.js";
import { ProductsManager } from "../dao/ProductsDao.js";

const getCartById = async (req, res) => {
    const { cid } = req.params;

    if (!cid) return res.status(400).json({ error: "Cart ID not provided" });

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
};

const getUserCart = async (req, res) => {
    try {
        const cartId = req.user.cart;
        if (!cartId) {
            return res
                .status(400)
                .json({ error: "Invalid cart ID for the logged-in user" });
        }

        const products = await CartsManager.getCartProducts(cartId);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching cart products:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const updateAllCart = async (req, res) => {
    const { cid } = req.params;
    const products = req.body;

    if (!cid || !products) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        const updatedCart = await CartsManager.updateAllCart(cid, products);
        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!cid || !pid || !quantity) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    const quantityNumber = Number(quantity);
    if (isNaN(quantityNumber))
        return res.status(400).json({ error: "Quantity must be a valid number" });

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
};

const createCart = async (req, res) => {
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
};

const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params;
    const userCart = req.user.cart;

    if (!userCart || userCart.toString() !== cid) {
        return res
            .status(403)
            .json({ error: "You are not allowed to modify this cart" });
    }

    if (!cid || !pid) {
        return res.status(400).json({ error: "Missing cart or product ID" });
    }

    try {
        const updatedCart = await CartsManager.addProductToCart(cid, pid);
        res
            .status(200)
            .json({ message: "Product added to cart successfully", updatedCart });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const deleteProductFromCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const userCart = req.user.cart;

    if (userCart !== cartId) {
        return res
            .status(403)
            .json({ error: "You are not allowed to modify this cart" });
    }

    if (!cartId || !productId) {
        return res.status(400).json({ error: "Missing cart or product ID" });
    }

    try {
        const updatedCart = await CartsManager.deleteProductFromCart(
            cartId,
            productId
        );
        res.status(200).json({ message: "Product removed from cart successfully" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const deleteAllProducts = async (req, res) => {
    const userCart = req.user.cart;

    if (!userCart) {
        return res.status(400).json({ error: "Cart ID not provided" });
    }

    try {
        await CartsManager.deleteAllProducts(userCart);
        res
            .status(200)
            .json({ message: "All products have been removed from the cart" });
    } catch (error) {
        console.error("Error removing all products from cart:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

const purchaseCart = async (req, res) => {
    const { cid } = req.params;
    const userEmail = req.user.email;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: `Invalid cart ID format: ${cid}` });
    }

    try {
        const cart = await CartsManager.getCartProducts(cid);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        let totalAmount = 0;
        const productsNotPurchased = [];

        for (const item of cart.products) {
            const productId = item.product._id || item.product;

            if (!isValidObjectId(productId)) {
                productsNotPurchased.push({ product: productId.toString(), reason: 'Invalid product ID' });
                continue;
            }

            const product = await ProductsManager.getProductById(productId);
            if (!product) {
                productsNotPurchased.push({ product: productId.toString(), reason: 'Product not found' });
                continue;
            }

            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                totalAmount += product.price * item.quantity;
                await ProductsManager.updateProduct(productId, { stock: product.stock });
            } else {
                productsNotPurchased.push({ product: productId.toString(), reason: 'Insufficient stock' });
            }
        }

        let newTicket = null;
        if (totalAmount > 0) {
            newTicket = new Ticket({
                amount: totalAmount,
                purchaser: userEmail,
            });
            await newTicket.save();
            newTicket = newTicket.toObject(); 
        }

        await CartsManager.updateCart(cid, []);

        return res.status(200).json({
            ticket: newTicket,
            productsNotPurchased
        });
    } catch (error) {
        console.error("Error during cart purchase:", error);
        res.status(500).json({
            error: "Server error",
            detail: error.message,
        });
    }
};

export default {
    getCartById,
    getUserCart,
    updateAllCart,
    updateProductQuantity,
    createCart,
    addProductToCart,
    deleteProductFromCart,
    deleteAllProducts,
    purchaseCart,
};