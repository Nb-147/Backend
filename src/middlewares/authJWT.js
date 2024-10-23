import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect("/?error=not_authenticated");
    }

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect("/?error=not_authenticated");
        }
        req.user = user;
        next();
    });
};