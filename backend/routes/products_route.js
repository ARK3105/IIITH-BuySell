import express from "express";
import Product from "../models/products.js";
import { authenticateToken } from "../config.js";


const router = express.Router();

router.use(authenticateToken);

router.post("/add", async (req, res) => {
  try {
    console.log("Adding product:");
    console.log(req.body);
    const product_name = req.body.name;
    const product_description = req.body.description;
    const product_price = req.body.price;
    const product_seller_id = req.body.Seller_Id; 
    const product_category = req.body.category;
    const product_image = req.body.image;
    const product_status="available";

    console.log("seller_id:", product_seller_id);

    const newProduct = new Product({
      name: product_name,
      description: product_description,
      price: product_price,
      Seller_Id: product_seller_id,
      category: product_category,
      image: product_image,
      status: product_status,
    });
    await newProduct.save();
    console.log("Product added successfully");
    return res.status(201).send(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/display", async (req, res) => {
  try {
    console.log("Fetching all products");
    const products = await Product.find();
    return res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("Product ID is required");
    }

    console.log("Fetching product with ID:", id);
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    return res.status(200).send(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).send("Invalid product ID format");
    }
    return res.status(500).send("Internal Server Error");
  }
});



export default router;
