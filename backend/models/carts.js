import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      min: 0,
    },
    quantity: { 
      type: Number,
      required: true,
      min: 0,
    },
    Buyer: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
); 

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
