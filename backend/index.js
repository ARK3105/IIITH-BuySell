import express from "express";
import { PORT, mongodb_url } from "./config.js";
import mongoose, { model } from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users_route.js";
import productRoutes from "./routes/products_route.js";
import cartRoutes from "./routes/carts_route.js";
import orderRoutes from "./routes/order_route.js";
import axios from "axios";  
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GENERATIVE_AI_API_KEY } from "./config.js";



const app = express();

app.use(express.json({ limit: "30mb" }));

app.use(cors());

app.get("/", (req , res) => {
  res.send("Welcome to the Buy-Sell Website");
});

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);


mongoose
  .connect(mongodb_url)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, (err) => {
      if (err) {
        console.error("Failed to start the server:", err);
        process.exit(1); 
      }
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

  const genAI = new GoogleGenerativeAI(GENERATIVE_AI_API_KEY);
 
  app.post("/support", async (req, res) => {
    const { messages } = req.body;
  
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      
      const conversationHistory = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
  
      const result = await model.generateContent(conversationHistory);
      const response = await result.response;
      const text = response.text();
  
      res.status(200).json({ reply: text });  
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ 
        error: 'Error communicating with Gemini',
        details: error.message 
      });
    }
  });

    
    const secret_key = "";


app.post("/verify-captcha", async (req, res) => {
  console.log("verify-captcha");
  const { token } = req.body;

  try {

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secret_key,
          response: token,
        },
      }
    );

    if (response.data.success) {
      console.log("CAPTCHA verification successful");
      res.json({ success: true });
    } else {
      console.error("CAPTCHA verification failed");
      res.status(400).json({ success: false, error: "CAPTCHA verification failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});
