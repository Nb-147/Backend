import { registerUser, loginUser, handleGithubCallback, verifyToken } from '../services/sessionsServices.js';

const getError = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ error: 'Error al autenticar' });
};

const getRegister = (req, res) => {
    res.render('register', { error: req.query.error });
};

const postRegister = async (req, res) => {
    try {
        const token = await registerUser(req.body);
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        return res.redirect('/products');
    } catch (error) {
        res.render('register', { error: error.message });
    }
};

const postLogin = async (req, res) => {
    try {
        const token = await loginUser(req.body.email, req.body.password);
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        return res.redirect('/products');
    } catch (error) {
        console.error('Error during login:', error);
        return res.redirect('/?error=Invalid email or password');
    }
};

const githubCallback = async (req, res) => {
    try {
        const token = await handleGithubCallback(req.user);
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
        const userDTO = verifyToken(token);
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