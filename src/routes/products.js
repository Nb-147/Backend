import express from 'express';
import { productsModel } from '../dao/models/productsModel.js';
import { cartsModel } from '../dao/models/cartsModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 5, page = 1, sort, query } = req.query; 
        const queryObject = {};
        if (query) {
            queryObject.$or = [
                { category: { $regex: query, $options: 'i' } },
                { status: query.toLowerCase() === 'available' }
            ];
        }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
            lean: true 
        };

        const result = await productsModel.paginate(queryObject, options);

        const response = {
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.hasPrevPage ? result.page - 1 : null,
            nextPage: result.hasNextPage ? result.page + 1 : null,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.page - 1}&limit=${limit}&sort=${sort || ''}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.page + 1}&limit=${limit}&sort=${sort || ''}` : null
        };

        res.render('index', { products: response.payload, ...response });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await productsModel.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const cartId = req.query.cartId || null;

        if (!cartId) {
            const newCart = await cartsModel.create({ products: [] });
            return res.redirect(`/api/products/${req.params.id}?cartId=${newCart._id}`);
        }

        res.render('productDetail', { product, cartId });
    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).json({ message: 'Error retrieving product', error });
    }
});

export default router;