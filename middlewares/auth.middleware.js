import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.authData = decoded;
      next();
    } catch (error) {
      res.status(401).json({id:0, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({id:0, message: "No token, authorization denied" });
  }
});
