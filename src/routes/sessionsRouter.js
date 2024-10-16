import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../dao/models/user.js';
import { config } from '../config/config.js';

const router = express.Router();

router.get("/error", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ error: `Error al autenticar` });
});

router.get('/register', (req, res) => {
    res.render('register', { error: req.query.error });
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, age } = req.body;

    if (!firstName || !lastName || !email || !password || age === undefined) {
        return res.render('register', { error: 'All fields are required' });
    }

    if (isNaN(age) || age <= 0) {
        return res.render('register', { error: 'Age must be a positive number' });
    }

    if (password.length < 6) {
        return res.render('register', { error: 'Password must be at least 6 characters long' });
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email)) {
        return res.render('register', { error: 'Invalid email format' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.render('register', { error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            age: Number(age),
            role: 'usuario'
        });
        await newUser.save();

        res.redirect('/?success=Registration successful, please login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register', { error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/?error=Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/?error=Invalid email or password');
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                cart: user.cart  
            },
            config.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        return res.redirect('/products');
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect('/?error=Internal server error');
    }
});

router.get('/github', passport.authenticate("github", { session: false }));

router.get("/callbackGithub",
    passport.authenticate("github", { failureRedirect: "/api/sessions/error", session: false }),
    async (req, res) => {
        try {
            const user = req.user;

            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    role: user.role || 'usuario',
                    cart: user.cart  
                },
                config.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.cookie('jwt', token, { httpOnly: true, secure: false });
            return res.redirect('/products');
        } catch (error) {
            console.error('Error during GitHub callback:', error);
            return res.redirect('/?error=Internal server error');
        }
    }
);

router.get('/logout', (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, secure: false });
    res.redirect('/?mensaje=Logout exitoso');
});

router.get('/current', (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        res.json({ message: 'Authenticated user', user: decoded });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;