import express from 'express';
import Cart from '../models/carts.js';
import Product from '../models/products.js';
import { authenticateToken } from '../config.js';



const router = express.Router();

router.use(authenticateToken);


router.post("/add", async (req, res) => {
    try {
        console.log("Adding to cart:");
        console.log("Request body for adding to cart is :", req.body);
        const product_id = req.body.product_id;
        const quantity = req.body.quantity;
        const Buyer = req.body.Buyer;
        const status = "cart";
        const cart_item = await Cart.findOne({ product_id: product_id , status: "cart"});
        if (cart_item && cart_item.status === "cart") {
            cart_item.quantity += quantity;
            await cart_item.save();
            console.log("Cart updated successfully");
            return res.status(200).send(cart_item);
        }
        const newCartItem = new Cart({
            product_id: product_id,
            quantity: quantity,
            Buyer: Buyer,
            status: status,
        });
        await newCartItem.save();
        console.log("Added to cart successfully");
        return res.status(201).send(newCartItem);

        
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).send("Internal Server Error");
    }
    });


router.get("/display", async (req, res) => {
    try {
        console.log("Fetching cart items");
        const cartItems = await Cart.find();
        return res.status(200).send(cartItems);
        
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).send("Internal Server Error");
    }
}
);



router.delete("/remove/:product_id", async (req, res) => {
    try {
        console.log("Removing from cart");
        const product_id = req.params.product_id;
        const cart_item = await Cart.findOne({ product_id: product_id });
        console.log("product_id:", product_id);
        if (!cart_item) {
            console.log("Product not in cart");
            return res.status(404).send("Product not in cart");
        }
        await cart_item.deleteOne();    
        console.log("Removed from cart successfully");
        return res.status(200).send("Removed from cart successfully");
    } catch (error) {
        console.error("Error removing from cart:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/order", async (req, res) => {
    try {
        console.log("Ordering cart items");
        // const carditems =req.body.cartItems;
        const cartItems= req.body.cartItems;
        const productItems = req.body.products;

        console.log("Products changing status to sold:", productItems);
        for (const productItem of productItems) {
            const product = await Product.findOne({ _id: productItem._id });
            if (product) {
                product.Bought_status = "sold";
                await product.save();
            }
        }
        console.log("Changed product status to sold successfully", productItems);


        for (const cartItem of cartItems) {
            const item = await Cart.findOne({ _id: cartItem._id });
            if (item) {
                item.status = "ordered";
                await item.save();
                
            }
        }
        console.log("Ordered cart items successfully");
        return res.status(200).send("Ordered cart items successfully");
    } catch (error) {
        console.error("Error ordering cart items:", error);
        return res.status(500).send("Internal Server Error");
    }
});


export default router;