const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

async function loadProducts() {
    const data = await fs.readFile(productsFilePath, 'utf8');
    return JSON.parse(data);
}

async function saveProducts(products) {
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
}

module.exports = (io) => {
    router.get('/', async (req, res) => {
        const products = await loadProducts();
        res.json(products);
    });

    router.post('/', async (req, res) => {
        const products = await loadProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { ...req.body, id: newId };
        products.push(newProduct);
        await saveProducts(products);
        io.emit('newProduct', newProduct);
        res.status(201).json(newProduct);
    });

    router.put('/:id', async (req, res) => {
        const products = await loadProducts();
        const productId = parseInt(req.params.id);
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const updatedProduct = { 
            ...products[index], 
            ...req.body, 
            id: productId, 
            code: products[index].code 
        };
        products[index] = updatedProduct;
        await saveProducts(products);
        io.emit('updateProduct', updatedProduct);
        res.json(updatedProduct);
    });

    router.delete('/:id', async (req, res) => {
        const products = await loadProducts();
        const productId = parseInt(req.params.id);
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const [deletedProduct] = products.splice(index, 1);
        await saveProducts(products);
        io.emit('removeProduct', deletedProduct.id);
        res.status(204).send();
    });

    return router;
};