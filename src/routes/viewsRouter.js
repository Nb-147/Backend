import express from 'express';
import viewsController from '../controllers/viewsController.js';
import { authenticateJWT } from '../middlewares/authJWT.js';
import { authWithRoles } from '../middlewares/auth.js';

export const viewsRouter = express.Router();

viewsRouter.get('/cart', authenticateJWT, viewsController.getCart);
viewsRouter.get('/products', authenticateJWT, viewsController.getProducts);
viewsRouter.get('/realtimeproducts', authenticateJWT, authWithRoles(['admin']), viewsController.getRealTimeProducts);
viewsRouter.get('/', viewsController.getLogin);
viewsRouter.get('/register', viewsController.getRegister);


export default viewsRouter;