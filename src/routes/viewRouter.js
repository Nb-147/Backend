import express from 'express';
import { productsModel } from '../dao/models/productsModel.js';
import { cartsModel } from '../dao/models/cartsModel.js'; 

export default (io) => {
    const router = express.Router();

    router.get('/index', async (req, res) => {
        try {
            // Busca o crea un carrito si no existe
            let cart = await cartsModel.findOne();
            if (!cart) {
                cart = new cartsModel({ products: [] });
                await cart.save();
            }

            // Obtén los productos y pasa el cartId a la vista
            const products = await productsModel.find();
            res.render('index', { products, cartId: cart._id });
        } catch (error) {
            res.status(500).json({ message: 'Error loading products or cart', error });
        }
    });

    router.get('/realtimeproducts', async (req, res) => {
        try {
            const products = await productsModel.find();
            res.render('realTimeProducts', { products });
        } catch (error) {
            res.status(500).json({ message: 'Error loading products', error });
        }
    });

    router.get('/cart/:cartId', async (req, res) => {
        try {
            const cart = await cartsModel.findById(req.params.cartId).populate('products.product'); 
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            res.render('cart', { cart });
        } catch (error) {
            res.status(500).json({ message: 'Error loading cart', error });
        }
    });

    io.on('connection', (socket) => {
        socket.emit('clientConnected', { message: 'Welcome, client connected!' });

        socket.on('newProduct', async (product) => {
            try {
                const newProduct = new productsModel(product);
                await newProduct.save();
                io.emit('newProduct', newProduct);
            } catch (error) {
                console.error('Error saving product:', error);
            }
        });

        socket.on('updateProduct', async (updatedProduct) => {
            try {
                const product = await productsModel.findByIdAndUpdate(updatedProduct._id, updatedProduct, { new: true });
                io.emit('updateProduct', product);
            } catch (error) {
                console.error('Error updating product:', error);
            }
        });
    });

    router.get('/', (req, res) => {
        res.render('home');
    });

    return router;
};
