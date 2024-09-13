import express from 'express';
import { cartsModel } from '../dao/models/cartsModel.js';
import { productsModel } from '../dao/models/productsModel.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newCart = new cartsModel({ products: [] });
        await newCart.save();
        res.status(201).json({ message: 'Cart created', cart: newCart });
    } catch (error) {
        res.status(500).json({ message: 'Error creating cart', error });
    }
});

router.get('/cart', async (req, res) => {
    try {
        const cart = await cartsModel.findOne().populate('products.product').lean();
        if (!cart || cart.products.length === 0) {
            return res.render('cart', { errorMessage: 'Your cart is empty' });
        }
        res.redirect(`/api/carts/${cart._id}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart', error });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartsModel.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart', error });
    }
});

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        const product = await productsModel.findById(pid);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingProductIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }

        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product to cart', error });
    }
});

router.post('/:cid/products/:pid/increase', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingProductIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += 1;
        }

        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error increasing product quantity', error });
    }
});

router.post('/:cid/products/:pid/delete', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);

        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error removing product from cart', error });
    }
});

router.post('/:cid/clear', async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.products = [];

        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error });
    }
});

router.get('/:cid/view', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartsModel.findById(cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).render('cart', { errorMessage: 'Cart not found' });
        }

        res.render('cart', { cart });
    } catch (error) {
        res.status(500).json({ message: 'Error loading cart view', error });
    }
});


router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.render('error', { message: 'Cart not found' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.render('error', { message: 'Error removing product from cart', error });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.render('error', { message: 'Cart not found' });
        }

        cart.products = products;
        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.render('error', { message: 'Error updating cart', error });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.render('error', { message: 'Cart not found' });
        }

        const product = cart.products.find(p => p.product.toString() === pid);
        if (!product) {
            return res.render('error', { message: 'Product not found in cart' });
        }

        product.quantity = quantity;
        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.render('error', { message: 'Error updating product quantity', error });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.render('error', { message: 'Cart not found' });
        }

        cart.products = [];
        await cart.save();

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.render('error', { message: 'Error clearing cart', error });
    }
});

export default router;