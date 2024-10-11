import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport'; 
import User from '../dao/models/user.js'; 

const router = express.Router();

router.get("/error", (req, res)=>{
    res.setHeader('Content-Type','application/json');
    return res.status(401).json({error:`Error al autenticar`})
})

router.get('/github',
    passport.authenticate("github", {}),    
)

// paso 3
router.get("/callbackGithub",
    passport.authenticate("github",{failureRedirect:"/api/sessions/error"}),
    (req, res)=>{

        // req.user   generado por el middleware passport si todo sale OK en el authencicate...!!!
        req.session.usuario=req.user

        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload:"Login exitoso", usuarioLogueado: req.user});
    }
)

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        req.session.error = 'All fields are required';
        return res.redirect('/');
    }

    if (password.length < 6) {
        req.session.error = 'Password must be at least 6 characters long';
        return res.redirect('/');
    }

    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(email)) {
        req.session.error = 'Invalid email format';
        return res.redirect('/');
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            req.session.error = 'User already exists';
            return res.redirect('/');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'usuario'
        });
        await newUser.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        req.session.error = 'Internal server error';
        res.redirect('/');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.session.error = 'Email and password are required';
        return res.redirect('/');
    }

    if (email === 'adminCoder@coder.com' && password === 'adminPass123') {
        req.session.user = {
            email,
            firstName: 'Admin',
            lastName: 'Coder',
            role: 'admin'
        };
        req.session.error = null;
        return res.redirect('/products');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.session.error = 'Invalid email or password';
            return res.redirect('/');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            req.session.error = 'Invalid email or password';
            return res.redirect('/');
        }

        req.session.user = {
            email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };

        req.session.error = null;
        res.redirect('/products');
    } catch (error) {
        console.error('Error logging in user:', error);
        req.session.error = 'Internal server error';
        res.redirect('/');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ error: 'Error al realizar logout' });
        }
        res.clearCookie('connect.sid');
        res.redirect('/?mensaje=Logout exitoso');
    });
});

export default router;
