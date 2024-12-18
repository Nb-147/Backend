import viewsService from '../services/viewsServices.js';
import { sendMail } from '../services/mailService.js';

const getCart = async (req, res) => {
    const cartId = req.user.cart;
    try {
        const cartProducts = await viewsService.getCartProducts(cartId);
        res.status(200).render('cart', {
            title: 'Cart',
            products: cartProducts.products,
            user: req.user,
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Server error',
            detail: error.message,
        });
    }
};

const getProducts = async (req, res) => {
    const cartId = req.user.cart;
    try {
        const { products, page, totalPages, numCarts } = await viewsService.getAllProductsWithCart(cartId);
        res.status(200).render('home', {
            title: 'Home',
            products,
            page,
            totalPages,
            numCarts,
            user: req.user,
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Server error',
            detail: error.message,
        });
    }
};

const getRealTimeProducts = async (req, res) => {
    try {
        const products = await viewsService.getAllProducts();
        res.status(200).render('realTimeProducts', {
            title: 'Real Time Products',
            products: products.payload,
            user: req.user,
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Server error',
            detail: error.message,
        });
    }
};

const getLogin = (req, res) => {
    const error = req.query.error || null;
    const mensaje = req.query.mensaje || null;
    res.render('login', { error, mensaje });
};

const getRegister = (req, res) => {
    res.render('register');
};

const getTicketPurchase = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const ticket = await viewsService.getTicketById(ticketId);

        await sendMail(
            req.user,
            req.user.email, 
            'Confirmación de compra', 
            `Gracias por tu compra. Aquí está el detalle de tu ticket: ${ticket.code}`, 
            `<h1>Gracias por tu compra</h1><p>Aquí está el detalle de tu ticket: ${ticket.code}</p>`
        );

        res.status(200).render('ticket', {
            title: 'Purchase Ticket',
            ticket,
            user: req.user,
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Server error',
            detail: error.message,
        });
    }
};


export default {
    getCart,
    getProducts,
    getRealTimeProducts,
    getLogin,
    getRegister,
    getTicketPurchase,
};