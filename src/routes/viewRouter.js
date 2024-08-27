const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const productsFilePath = path.join(__dirname, '../data/products.json');
let products = [];

const loadProducts = async () => {
    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        products = JSON.parse(data);
    } catch (error) {
        products = [];
    }
};

const saveProducts = async () => {
    try {
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error saving products:', error);
    }
};

module.exports = (io) => {
    const router = express.Router();

    router.get('/index', async (req, res) => {
        await loadProducts();
        res.render('index', { products });
    });

    router.get('/realtimeproducts', async (req, res) => {
        await loadProducts();
        res.render('realTimeProducts', { products });
    });

    io.on('connection', (socket) => {
        socket.emit('clientConnected', { message: 'Welcome, client connected!' });

        socket.emit('initialProducts', products);

        socket.on('newProduct', async (product) => {
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            const newProduct = { id: newId, ...product };
            products.push(newProduct);
            await saveProducts();
            io.emit('updateProducts', newProduct);
        });

        socket.on('updateProduct', async (updatedProduct) => {
            const index = products.findIndex(p => p.id == updatedProduct.id);
            if (index !== -1) {
                products[index] = { ...products[index], ...updatedProduct };
                await saveProducts();
                io.emit('updateProduct', products[index]);
            }
        });

        socket.on('deleteProduct', async (productId) => {
            const index = products.findIndex(p => p.id == productId);
            if (index !== -1) {
                products.splice(index, 1);
                await saveProducts();
                io.emit('removeProduct', productId);
            }
        });

        socket.on('disconnect', () => {});
    });

    router.get('/', (req, res) => {
        res.render('home');
    });

    return router;
};