import { Router } from "express";
import productsController from "../controllers/productsController.js";
import { auth } from "../middlewares/auth.js";
import { authWithRoles } from "../middlewares/auth.js";

export const productsRouter = Router();

productsRouter.post("/", auth, authWithRoles(['admin']), productsController.createProduct);
productsRouter.put("/:pid", auth, authWithRoles(['admin']), productsController.updateProduct);
productsRouter.delete("/:pid", auth, authWithRoles(['admin']), productsController.deleteProduct);
productsRouter.get("/:pid", auth, productsController.getProductById);
productsRouter.get("/", auth, productsController.getAllProducts);