import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../dao/models/userModel.js';
import { config } from '../config/config.js';
import { CartsManager } from '../dao/CartsDao.js';
import { UserDTO } from '../dto/userDto.js';


const getError = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ error: 'Error al autenticar' });
};

const getRegister = (req, res) => {
    res.render('register', { error: req.query.error });
};

const postRegister = async (req, res) => {
    const { first_name, last_name, email, password, age } = req.body;

    if (!first_name || !last_name || !email || !password || age === undefined) {
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
        const newCart = await CartsManager.createCart(); // Crear un nuevo carrito

        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            age: Number(age),
            role: 'usuario',
            cart: newCart._id // Asignar el carrito al usuario
        });

        await newUser.save();

        // Crear un JWT que incluya el `cartId` recién creado
        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role,
                cart: newUser.cart
            },
            config.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Guardar el token en una cookie para autenticación
        res.cookie('jwt', token, { httpOnly: true, secure: false });

        return res.redirect('/products');
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register', { error: 'Internal server error' });
    }
};

const postLogin = async (req, res) => {
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

        if (!user.cart) {
            const cart = await CartsManager.createCart();
            user.cart = cart._id;
            await user.save();
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
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
};


const githubCallback = async (req, res) => {
    try {
        const user = req.user;

        if (!user.cart) {
            const cart = await CartsManager.createCart();
            user.cart = cart._id;
            await user.save();
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
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
};

const getLogout = (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, secure: false });
    res.redirect('/?mensaje=Logout exitoso');
};

const getCurrent = (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const userDTO = new UserDTO(decoded);
        res.json({ message: 'Authenticated user', user: userDTO });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export default {
    getError,
    getRegister,
    postRegister,
    postLogin,
    githubCallback,
    getLogout,
    getCurrent,
};