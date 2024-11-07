import mongoose from 'mongoose';
import { preSave } from '../../middlewares/preSave.js';


const userSchema = new mongoose.Schema({
    first_name: { type: String, required: [true, 'First name is required'] },
    last_name: { type: String, required: [true, 'Last name is required'] },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid email format'] 
    },
    age: { type: Number, required: true, default: 18 }, 
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'] 
    },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' },
    role: { type: String, default: 'user' }
});

preSave(userSchema);

const User = mongoose.model('user', userSchema);

export default User;

//Clave de los usuarios: Coder123, tambien para el de adminCoder@coder.com 