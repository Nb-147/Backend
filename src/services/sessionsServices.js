import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../dao/models/userModel.js';
import { config } from '../config/config.js';
import { CartsManager } from '../dao/CartsDao.js';
import { UserDTO } from '../dto/userDto.js';

export const registerUser = async (userData) => {
    const { first_name, last_name, email, password, age } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCart = await CartsManager.createCart();

    const newUser = new User({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        age: Number(age),
        role: 'user',
        cart: newCart._id,
    });

    await newUser.save();

    const token = jwt.sign(
        {
            id: newUser._id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
            cart: newUser.cart,
        },
        config.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return token;
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

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
            cart: user.cart,
        },
        config.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return token;
};

export const handleGithubCallback = async (user) => {
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
            role: user.role || 'user',
            cart: user.cart,
        },
        config.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return token;
};

export const verifyToken = (token) => {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return new UserDTO(decoded);
};