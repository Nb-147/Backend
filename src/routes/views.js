import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productsFilePath = path.join(__dirname, '../data/products.json');

router.get('/', async (req, res) => {
    const products = JSON.parse(await fs.readFile(productsFilePath, 'utf8'));
    res.render('index', { products });
});

router.get('/realtimeproducts', async (req, res) => {
    const products = JSON.parse(await fs.readFile(productsFilePath, 'utf8'));
    res.render('realTimeProducts', { products });
});

export default router;