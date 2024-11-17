import { Router } from "express";
import multer from "multer"; 
import productsController from "../controllers/productsController.js";
import { auth } from "../middlewares/auth.js";
import { authWithRoles } from "../middlewares/auth.js";

export const productsRouter = Router();
const upload = multer(); 

productsRouter.post("/", auth, authWithRoles(['admin']), upload.none(),);

productsRouter.put("/:pid", auth, authWithRoles(['admin']), upload.none(), productsController.updateProduct);

productsRouter.delete("/:pid", auth, authWithRoles(['admin']), productsController.deleteProduct);

productsRouter.get("/:pid", auth, productsController.getProductById);
productsRouter.get("/", auth, productsController.getAllProducts);
