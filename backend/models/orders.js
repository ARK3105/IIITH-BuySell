
import mongoose from "mongoose";




const orderSchema = new mongoose.Schema({
    Buyer_Id: {
        type : String,
        required: true
    },
    Seller_Id: { 
        type : String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    },
    Hashed_OTP: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        required: true
        // enum: ['pending', 'completed', 'cancelled']
    },
    product_id: {
        type: String,
        required: true
    }
}, { timestamps: true });



const Order = mongoose.model('Order', orderSchema);

export default Order;
