import { CartsManager } from '../dao/CartsDao.js';
import { isValidObjectId } from 'mongoose';
import { io } from '../app.js';

const getCartById = async (cid) => {
    if (!cid) throw new Error('Cart ID not provided');
    if (!isValidObjectId(cid)) throw new Error('Invalid cart ID');

    return await CartsManager.getCartProducts(cid);
};

const getUserCart = async (cartId) => {
    if (!cartId || !isValidObjectId(cartId)) {
        throw new Error('Invalid cart ID for the logged-in user');
    }

    return await CartsManager.getCartProducts(cartId);
};

const updateAllCart = async (cid, products) => {
    if (!cid || !products) {
        throw new Error('Missing required parameters');
    }

    if (!isValidObjectId(cid)) throw new Error('Invalid cart ID');

    const updatedCart = await CartsManager.updateAllCart(cid, products);
    io.emit('cartUpdated', updatedCart);
    return updatedCart;
};

const updateProductQuantity = async (cid, pid, quantity) => {
    if (!cid || !pid || !quantity) {
        throw new Error('Missing required parameters');
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        throw new Error('Invalid cart or product ID');
    }

    const quantityNumber = Number(quantity);
    if (isNaN(quantityNumber)) throw new Error('Quantity must be a valid number');

    return await CartsManager.updateProductQuantity(cid, pid, quantityNumber);
};

const createCart = async () => {
    return await CartsManager.createCart();
};

const addProductToCart = async (cid, pid, userCart) => {
    if (userCart !== cid) {
        throw new Error('You are not allowed to modify this cart');
    }

    if (!cid || !pid) {
        throw new Error('Missing cart or product ID');
    }

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        throw new Error('Invalid cart or product ID');
    }

    return await CartsManager.addProductToCart(cid, pid);
};

const deleteProductFromCart = async (cartId, productId, userCart) => {
    if (userCart !== cartId) {
        throw new Error('You are not allowed to modify this cart');
    }

    if (!cartId || !productId) {
        throw new Error('Missing cart or product ID');
    }

    if (!isValidObjectId(cartId) || !isValidObjectId(productId)) {
        throw new Error('Invalid cart or product ID');
    }

    const updatedCart = await CartsManager.deleteProductFromCart(cartId, productId);
    io.emit('cartUpdated', updatedCart);
    return updatedCart;
};

const deleteAllProducts = async (userCart) => {
    if (!userCart) {
        throw new Error('Cart ID not provided');
    }

    if (!isValidObjectId(userCart)) throw new Error('Invalid cart ID');

    return await CartsManager.deleteAllProducts(userCart);
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
};
