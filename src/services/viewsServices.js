import { ProductsManager } from '../dao/ProductsDao.js';
import { CartsManager } from '../dao/CartsDao.js';
import Ticket from '../dao/models/ticketModel.js';

const getCartProducts = async (cartId) => {
    try {
        const cartProducts = await CartsManager.getCartProducts(cartId);
        if (!cartProducts || !cartProducts.products) {
            throw new Error('Cart not found');
        }
        return cartProducts;
    } catch (error) {
        console.error('Error loading cart:', error);
        throw new Error(error.message);
    }
};

const getAllProductsWithCart = async (cartId) => {
    try {
        const products = await ProductsManager.getProducts();
        const cart = await CartsManager.getCartProducts(cartId);

        if (!products || !products.payload || !cart || !cart.products) {
            throw new Error('Products or cart not found');
        }

        let totalProducts = 0;
        cart.products.forEach((p) => {
            totalProducts += p.quantity;
        });

        return {
            products: products.payload,
            page: products.page || 1,
            totalPages: products.totalPages || 1,
            numCarts: totalProducts,
        };
    } catch (error) {
        console.error('Error loading products and cart:', error);
        throw new Error(error.message);
    }
};

const getAllProducts = async () => {
    try {
        const products = await ProductsManager.getProducts();
        if (!products || !products.payload) {
            throw new Error('Products not found');
        }
        return products;
    } catch (error) {
        console.error('Error loading real-time products:', error);
        throw new Error(error.message);
    }
};

const getTicketById = async (ticketId) => {
    try {
        const ticket = await Ticket.findById(ticketId).lean();
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return ticket;
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw new Error('Error fetching ticket data');
    }
};

export default {
    getCartProducts,
    getAllProductsWithCart,
    getAllProducts,
    getTicketById,
};