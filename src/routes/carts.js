const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

let carts = [];
let products = [];

const loadData = async () => {
    try {
        try {
            const data = await fs.readFile(cartsFilePath, 'utf8');
            carts = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                carts = [];
            } else {
                console.error('Error reading carts file:', err);
            }
        }

        try {
            const data = await fs.readFile(productsFilePath, 'utf8');
            products = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                products = [];
            } else {
                console.error('Error reading products file:', err);
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const saveCarts = async () => {
    try {
        await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    } catch (error) {
        console.error('Error saving carts:', error);
    }
};

(async () => {
    await loadData();
})();

router.get('/:cid', (req, res) => {
    const cartId = req.params.cid;
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).json({ error: 'Cart not found' });
    }
});

router.post('/', async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Products array is required' });
    }

    const newId = carts.length > 0 ? (Math.max(...carts.map(c => parseInt(c.id))) + 1).toString() : '1';

    const newCart = {
        id: newId,
        products: products.map(p => ({
            product: p.product,
            quantity: p.quantity
        }))
    };

    carts.push(newCart);
    await saveCarts();
    res.status(201).json(newCart);
});

router.put('/:cid/product/:pid', async (req, res) => {
    const cart = carts.find(c => c.id === req.params.cid);
    const product = products.find(p => p.id === req.params.pid);

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { quantity } = req.body;

    if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const existingProductInCart = cart.products.find(p => p.product === req.params.pid);

    if (existingProductInCart) {
        existingProductInCart.quantity = parseInt(quantity);
    } else {
        return res.status(404).json({ error: 'Product not found in cart' });
    }

    await saveCarts();
    res.json(cart);
});

router.delete('/:cid/product/:pid', async (req, res) => {
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    const productIndex = cart.products.findIndex(p => p.product === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found in cart' });
    }

    cart.products.splice(productIndex, 1);

    await saveCarts();
    res.json(cart);
});

module.exports = router;