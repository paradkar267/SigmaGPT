// Authentication routes: signup, login, logout, and current-user session lookup.
import express from "express";
import mongoose from "mongoose";
import passport from "../utils/passport.js";
import User from "../model/user.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

router.post("/signup", async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ error: "Database is not connected" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.register(
      new User({
        name: name.trim(),
        email: normalizedEmail,
        username: normalizedEmail,
      }),
      password,
    );

    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({
        message: "Account created successfully",
        user: user.toSafeObject(),
      });
    });
  } catch (err) {
    if (err.name === "UserExistsError") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    return next(err);
  }
});

router.post("/login", (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ error: "Database is not connected" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ error: info?.message || "Invalid email or password" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({
        message: "Login successful",
        user: user.toSafeObject(),
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  if (!req.isAuthenticated?.()) {
    return res.json({ message: "Logged out successfully" });
  }

  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });
});

router.get("/me", protect, (req, res) => {
  res.json(req.user.toSafeObject());
});

export default router;
