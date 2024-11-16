import { Router } from 'express';
import cartsController from '../controllers/cartsController.js';
import { authenticateJWT } from '../middlewares/authJWT.js';
import { authWithRoles } from '../middlewares/auth.js';
import passport from 'passport';

export const cartsRouter = Router();

cartsRouter.get('/:cid', authenticateJWT, cartsController.getCartById);
cartsRouter.get('/', authenticateJWT, cartsController.getUserCart);

cartsRouter.put('/:cid', authenticateJWT, cartsController.updateAllCart);
cartsRouter.put('/:cid/products/:pid', authenticateJWT, cartsController.updateProductQuantity);

cartsRouter.post('/', authenticateJWT, cartsController.createCart)
cartsRouter.post('/:cid/products/:pid', authenticateJWT, authWithRoles(['user']), cartsController.addProductToCart);

cartsRouter.post('/:cid/purchase', passport.authenticate('current', { session: false }), cartsController.purchaseCart);

cartsRouter.delete('/:cartId/products/:productId', authenticateJWT, cartsController.deleteProductFromCart);
cartsRouter.delete('/:cartId', authenticateJWT, cartsController.deleteAllProducts);

