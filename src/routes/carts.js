import express from 'express';
import { cartsModel } from '../dao/models/cartsModel.js';
import { productsModel } from '../dao/models/productsModel.js';

const router = express.Router();

const findCartById = async (req, res, next) => {
    const { cid } = req.params;
    try {
        const cart = await cartsModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).render('error', { message: 'Cart not found' });
        }
        req.cart = cart; 
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart', error });
    }
};

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
        let cart = await cartsModel.findOne().populate('products.product').lean();
        if (!cart) {
            cart = new cartsModel({ products: [] });
            await cart.save();
        }
        res.redirect(`/api/carts/${cart._id}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart', error });
    }
});

router.get('/:cid/view', findCartById, (req, res) => {
    res.render('cart', { cart: req.cart });
});

router.post('/:cid/products/:pid', findCartById, async (req, res) => {
    try {
        const { pid } = req.params;
        const { quantity = 1 } = req.body;

        const product = await productsModel.findById(pid);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingProduct = req.cart.products.find(p => p.product.toString() === pid);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            req.cart.products.push({ product: pid, quantity });
        }

        await cartsModel.findByIdAndUpdate(req.cart._id, req.cart);
        res.redirect(`/api/carts/${req.cart._id}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error adding/updating product in cart', error });
    }
});

router.post('/:cid/products/:pid/increase', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).render('error', { message: 'Cart not found' });
        }

        const product = cart.products.find(p => p.product.toString() === pid);
        if (product) {
            product.quantity += 1;
            await cart.save();
        }

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
            return res.status(404).render('error', { message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex !== -1) {
            const product = cart.products[productIndex];

            if (product.quantity > 1) {
                product.quantity -= 1;
            } else {
                cart.products.splice(productIndex, 1);
            }

            await cart.save();
        }

        res.redirect(`/api/carts/${cid}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error removing or decreasing product quantity', error });
    }
});

router.post('/:cid/clear', findCartById, async (req, res) => {
    try {
        req.cart.products = [];
        await cartsModel.findByIdAndUpdate(req.cart._id, req.cart);

        res.redirect(`/api/carts/${req.cart._id}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error });
    }
});

router.put('/:cid', findCartById, async (req, res) => {
    try {
        const { products } = req.body;

        req.cart.products = products;
        await cartsModel.findByIdAndUpdate(req.cart._id, req.cart);

        res.redirect(`/api/carts/${req.cart._id}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error });
    }
});

router.put('/:cid/products/:pid', findCartById, async (req, res) => {
    try {
        const { pid } = req.params;
        const { quantity } = req.body;

        const product = req.cart.products.find(p => p.product.toString() === pid);
        if (!product) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        product.quantity = quantity;
        await cartsModel.findByIdAndUpdate(req.cart._id, req.cart);

        res.redirect(`/api/carts/${req.cart._id}/view`);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product quantity', error });
    }
});

export default router;