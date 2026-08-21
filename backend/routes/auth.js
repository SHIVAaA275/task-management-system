const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

// Signup Route
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ email, password: hashedPassword });
      await user.save();

      // Updated with fallback key
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET || "defaultsecretkey123", 
        { expiresIn: "1d" }
      );

      res.status(201).json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
      next(error);
    }
  }
);

// Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").exists().withMessage("Password is required")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Updated with fallback key
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET || "defaultsecretkey123", 
        { expiresIn: "1d" }
      );

      res.json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;