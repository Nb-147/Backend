import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        code: { type: String, unique: true },
        price: Number,
        status: { type: Boolean, default: true }, 
        stock: Number,
        category: String,
        thumbnails: { type: [String], default: [] } 
    },
    { timestamps: true }
);

productSchema.plugin(paginate);

export const productsModel = mongoose.model('products', productSchema);