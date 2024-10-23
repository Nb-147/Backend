import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const auth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `Unauthorized - token not provided` });
    }

    try {
        const usuario = jwt.verify(token, config.JWT_SECRET);
        req.user = usuario; 
        res.locals.user = usuario;  
        next();
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `Unauthorized`, detail: error.message });
    }
};

export const authWithRoles = (roles = []) => {
    return (req, res, next) => {
        if (!Array.isArray(roles)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error in route permissions` });
        }

        roles = roles.map(role => role.toLowerCase());
        if (roles.includes("public")) {
            return next();
        }

        if (!req.user || !req.user.role) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({ error: `Unauthorized - role missing` });
        }

        if (!roles.includes(req.user.role.toLowerCase())) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({ error: `Unauthorized - insufficient privileges` });
        }

        next();
    };
};