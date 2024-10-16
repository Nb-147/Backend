import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const auth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `Unauthorized` });
    }

    try {
        const usuario = jwt.verify(token, config.JWT_SECRET); 
        req.user = usuario; 
        next();
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `Unauthorized`, detalle: error.message });
    }
};
