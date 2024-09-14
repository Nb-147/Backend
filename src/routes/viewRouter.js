import express from 'express';
import { productsModel } from '../dao/models/productsModel.js';
import { cartsModel } from '../dao/models/cartsModel.js'; 

export default (io) => {
    const router = express.Router();

    router.get('/index', async (req, res) => {
        try {
            let cart = await cartsModel.findOne();
            if (!cart) {
                cart = new cartsModel({ products: [] });
                await cart.save();
            }

            const products = await productsModel.find();
            res.render('index', { products, cartId: cart._id });
        } catch (error) {
            res.status(500).json({ message: 'Error loading products or cart', error });
        }
    });

    router.get('/realtimeproducts', async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query; 
    
            const options = {
                page: parseInt(page), 
                limit: parseInt(limit), 
                lean: true 
            };
    
            const result = await productsModel.paginate({}, options);
    
            res.render('realTimeProducts', {
                products: result.docs,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/realtimeproducts?page=${result.page - 1}&limit=${limit}` : null,
                nextLink: result.hasNextPage ? `/realtimeproducts?page=${result.page + 1}&limit=${limit}` : null,
                page: result.page,
                totalPages: result.totalPages
            });
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

        socket.on('newProductNotification', async (newProduct) => {
            io.emit('newProduct', newProduct);
        });

        socket.on('updateProductNotification', async (updatedProduct) => {
            io.emit('updateProduct', updatedProduct);
        });

        socket.on('deleteProduct', async (productId) => {
            try {
                const deletedProduct = await productsModel.findByIdAndDelete(productId);
                if (deletedProduct) {
                    io.emit('removeProduct', productId);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        });
    });

    router.get('/', (req, res) => {
        res.render('home');
    });

    return router;
}