import express from "express";
import { User } from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateCasTicket } from "../cas_middleware.js";
import { casConfig } from "../config.js";
import { authenticateToken } from "../config.js";

const router = express.Router();

// router.use(authenticateToken);

// Route that initiates CAS login
router.get("/cas/login", (req, res) => {
  console.log("Redirecting to CAS login reached in backend");
  const loginUrl = `${casConfig.cas_url}/login?service=${encodeURIComponent(
    casConfig.service_url + "/users/cas/callback"
  )}`;
  // loginUrl = "${casConfig.cas_url}/login";
  console.log("Login URL:", loginUrl);
  // res.json({})
  res.redirect(loginUrl);
});

// CAS Callback route
router.get("/cas/callback", async (req, res) => {
  try {
    const { ticket } = req.query;
    if (!ticket) {
      return res.redirect("http://localhost:5173/login?error=no_ticket");
    }

    // Validate the CAS ticket
    const userData = await validateCasTicket(ticket);

    if (userData) {
      console.log("user is validated");

      console.log("User email:", userData.email);
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log("User already exists");
        const token = jwt.sign(
          { id: existing._id, email: existing.email },
          "Thereisnosecretkey", 
          { expiresIn: "7d" } 
        );
        res.redirect(`http://localhost:5173/set-token?token=${token}`);  
      } else {
        console.log("User does not exist");
        res.redirect("http://localhost:5173/login?error=user_not_found");
      }
    } else {
      console.log("user is not validated");
      res.redirect("http://localhost:5173/login?error=validation_failed");
    }
  } catch (error) {
    console.error("CAS authentication error:", error);
    // Log more details about the error
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.redirect(`http://localhost:5173/login?error=cas_auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("Creating user:", req.body);
    const user_name = req.body.firstName;
    const user_email = req.body.email;
    const user_age = req.body.age;
    const user_contact = req.body.contactNumber;
    const user_password = req.body.password;
    const user_lastname = req.body.lastName;


    const existingUser = await User.findOne({ email: user_email });
    if (existingUser) {
      return res.status(400).send({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);
    console.log("Hashed password:", hashedPassword);

    const newUser = new User({
      firstName: user_name,
      email: user_email,
      age: user_age,
      contactNumber: user_contact,
      lastName: user_lastname,
      password: hashedPassword,
    });
    await newUser.save();
    console.log("User created successfully");


    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      "Thereisnosecretkey" 
    );

    return res.status(201).send({ token, user: newUser });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status;
  }
});

router.post("/check", async (req, res) => {
  try {
    const { email, password_check } = req.body;

    console.log("Checking user with email:", email);
    console.log("Checking user with password:", password_check);

    const existingUser = await User.findOne({ email });


    if (!existingUser) {
      console.log("User does not exist");
      return res.status(200).send({ exists: false, error_issue: "email" });
    }

    console.log("User exists:", existingUser);

    const passwordCorrect = await bcrypt.compare(
      password_check,
      existingUser.password
    );

    if (passwordCorrect) {
      console.log("Password is correct");

      const token = jwt.sign(
        { id: existingUser._id, email: existingUser.email },
        "Thereisnosecretkey",
        { expiresIn: "7d" }
      );

      console.log("Login successful");
      return res.status(200).send({ exists: true, error_issue: "none", token });
    } else {
      console.log("Password is incorrect");
      return res.status(200).send({ exists: false, error_issue: "password" });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/verify", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ valid: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "Thereisnosecretkey"); 
    if (!decoded) {
      return res
        .status(401)
        .send({ valid: false, message: "Invalid token or token not decoded" });
    }

    return res.status(200).send({ valid: true });
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).send({ valid: false, message: "Invalid token" });
  }
});


router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const email = req.query.email; 
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, age, contactNumber } = req.body;
    const email = req.user.email;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { firstName, lastName, age, contactNumber },
      { new: true } 
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

router.get("/details/:email", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching user details of email:", req.params.email);
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// Test route for debugging CAS validation
router.get("/cas/test", async (req, res) => {
  const { ticket } = req.query;
  if (!ticket) {
    return res.json({ error: "No ticket provided" });
  }
  
  try {
    const userData = await validateCasTicket(ticket);
    res.json({ success: true, userData });
  } catch (error) {
    console.error("Test CAS validation error:", error);
    res.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Error handling route
router.get("/error", (req, res) => {
  const { error } = req.query;
  console.log("Authentication error:", error);
  res.json({ 
    message: "Authentication error", 
    error: error,
    timestamp: new Date().toISOString()
  });
});

export default router;
