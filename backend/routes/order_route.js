import express from "express";
import Order from "../models/orders.js";
import brcrypt from "bcryptjs";
import { authenticateToken } from "../config.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/add-order", async (req, res) => {
  console.log("Adding order");
  console.log("Request body for order is :", req.body);
  try {
    const orders = req.body.orders;
    console.log("Orders are here :", orders);
    const savedOrders = [];

    for (const order of orders) {
      const { buyer_id, product_id, seller_id, quantity, amount, otp } = order;

      // const Transaction_Id = counter.seq;
      const Status = "pending";

      // const hashedOtp = await brcrypt.hash(otp, 10);
      const hashedOtp = await brcrypt.hash(String(otp), 10);

      const newOrder = new Order({
        Buyer_Id: buyer_id,
        Seller_Id: seller_id,
        Amount: amount,
        Hashed_OTP: hashedOtp,
        Status,
        product_id: product_id, 
      });

      await newOrder.save();
      savedOrders.push(newOrder);
    }

    console.log("Orders added successfully");
    res.status(201).send(savedOrders);
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/verify-otp", async (req, res) => {
  console.log("Verifying OTP");
  console.log("Request body for verifying OTP is :", req.body);

  try {
    const otp = req.body.otp;
    const product_id = req.body.productId;

    const order = await Order.findOne({ _id: product_id , Status: "pending" });
    console.log("Order is searched fmor abcckend:", order);
    if (!order) {
      console.log("Order not found");
      return res.status(404).send({ success: false });
    }

    const isMatch = await brcrypt.compare(otp, order.Hashed_OTP);
    if (isMatch) {
      console.log("OTP matched");

      await Order.findByIdAndUpdate(order._id, { Status: "delivered" });
      console.log("Order status updated to delivered");
      return res.status(200).send({ success: true });
    }
    console.log("OTP not matched");
    return res.status(200).send({ success: false });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/display", async (req, res) => {
  try {
    console.log("Fetching all orders");
    const orders = await Order.find();
    return res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/update-status", async (req, res) => {
  console.log("Updating order status");
  console.log("Request body for updating order status is :", req.body);
  try {
    const { productId } = req.body;
    const order = await Order.findOne({ _id: productId });
    if (!order) {
      console.log("Order not found");
      return res.status(404).send("Order not found");
    }

    await Order.findByIdAndUpdate(order._id, { Status: "delivered" });
    console.log("Order status updated to delivered");
    return res.status(200).send("Order status updated to delivered");
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).send("Internal Server Error");
  }
});

export default router;
