import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    Seller_Id: {
        type: String,
        required: true,
        min: 0 
    },
    category : {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true }); 

const Product = mongoose.model('Product', productSchema);
export default Product;