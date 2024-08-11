const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const productsFilePath = path.join(__dirname, '../data/products.json');

let products = [];

const loadProducts = async () => {
    try {
        if (await fs.access(productsFilePath).then(() => true).catch(() => false)) {
            const data = await fs.readFile(productsFilePath, 'utf8');
            products = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
};

const saveProducts = async () => {
    try {
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error saving products:', error);
    }
};

(async () => {
    await loadProducts();
})();

router.get('/', (req, res) => {
    const { limit } = req.query;
    if (limit) {
        res.json(products.slice(0, Number(limit)));
    } else {
        res.json(products);
    }
});

router.get('/:pid', (req, res) => {
    const product = products.find(p => p.id == req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto thumbnails." });
    }

    const existingProduct = products.find(product => product.code === code);
    if (existingProduct) {
        return res.status(400).json({ error: "El código ya existe. Por favor elija un código diferente." });
    }

    const newId = products.length > 0 ? Math.max(...products.map(product => product.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    await saveProducts();
    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const { code } = req.body;
    const index = products.findIndex(p => p.id == req.params.pid);

    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = products.find(product => product.code === code && product.id != req.params.pid);
    if (existingProduct) {
        return res.status(400).json({ error: "El código ya existe en otro producto. Por favor elija un código diferente." });
    }

    const updatedProduct = { ...products[index], ...req.body, id: products[index].id };
    products[index] = updatedProduct;
    await saveProducts();
    res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index !== -1) {
        products.splice(index, 1);
        await saveProducts();
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

module.exports = router;