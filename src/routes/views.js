const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

router.get('/', async (req, res) => {
    const products = JSON.parse(await fs.readFile(productsFilePath, 'utf8'));
    res.render('index', { products });
});

router.get('/realtimeproducts', async (req, res) => {
    const products = JSON.parse(await fs.readFile(productsFilePath, 'utf8'));
    res.render('realTimeProducts', { products });
});

module.exports = router;