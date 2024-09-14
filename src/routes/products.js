import express from 'express';
import { productsModel } from '../dao/models/productsModel.js';
import { cartsModel } from '../dao/models/cartsModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category, availability } = req.query;

        const queryObject = {};

        if (category && category.toLowerCase() !== 'all') {
            queryObject.category = { $regex: category, $options: 'i' };
        }

        if (availability) {
            queryObject.status = availability.toLowerCase() === 'available';
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
            prevLink: result.hasPrevPage ? `/api/products?page=${result.page - 1}&limit=${limit}&sort=${sort || ''}&category=${category || ''}&availability=${availability || ''}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.page + 1}&limit=${limit}&sort=${sort || ''}&category=${category || ''}&availability=${availability || ''}` : null
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
            var cart = await cartsModel.findOne().populate('products.product').lean();
            if (!cart) {
                cart = await cartsModel.create({ products: [] });
            }

            return res.redirect(`/api/products/${req.params.id}?cartId=${cart._id}`);
        }

        res.render('productDetail', { product, cartId });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = new productsModel(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await productsModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await productsModel.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

export default router;