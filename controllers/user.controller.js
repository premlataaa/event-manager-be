import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Register a new user
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({id:0, message: "Please add all fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({id:0, message: "User already exists" });
    }
    const generateToken = (user) => {
        return jwt.sign(
            {
                user_id: user._id,
                name: user.name
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30d" }
        );
    };

    const user = await User.create({
        name,
        email,
        password,
    });
    res.status(201).json({ _id: user._id, name, email, token: generateToken(user) });
});

// Authenticate a user
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({id:0, message: "Please add all fields" });
    }
    const user = await User.findOne({ email });
    const generateToken = (user) => {
        return jwt.sign( {
                    user_id: user._id,
                    name: user.name
                },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30d" }
        );
    };

    if (user && (await user.comparePassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email,
            token: generateToken(user)
        });
    } else {
        res.status(400).json({id:0, message: "Invalid credentials" });
    }
});
