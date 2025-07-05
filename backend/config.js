export const PORT = 5688;

export const mongodb_url=''

export const GENERATIVE_AI_API_KEY = "";

export const casConfig = {
    cas_url: 'https://login.iiit.ac.in/cas',
    service_url: 'http://localhost:5688',
    cas_version: '3.0',
  };
  
  import jwt from "jsonwebtoken";

 export const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    jwt.verify(token, "Thereisnosecretkey", (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
  
      req.user = user;
      next();
    });
  };
  
