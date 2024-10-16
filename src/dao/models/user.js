import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid email format'] 
    },
    age: { type: Number, required: [true, 'Age is required'] },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'] 
    },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' },
    role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

export default User;