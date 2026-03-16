import Parent from "../models/parent.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utillity/jwt.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Register
export const register = async (req, res) => {
  const {name, email, password } = req.body;

  try {
    const existing = await Parent.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = await Parent.create({
      name,
      email,
      password: hashedPassword
    });
    const token = generateToken(email)


    res.status(201).json({ message: "Parent registered successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const parent = await Parent.findOne({ email });
    if (!parent) return res.status(404).json({ message: "User not found" });
    const validPass = await bcrypt.compare(password, parent.password);
    if (!validPass) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(email)

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, parent.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    parent.password = await bcrypt.hash(newPassword, 10);
    await parent.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getParent = async (req, res) => {
  try {
    const email = req.user.email;
    const parent = await Parent.findOne({ email });
    if (!parent) return res.status(404).json({ message: "User not found" });
    const { name } = parent;
    res.json({ name, email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Auth0 post-login sync — upsert parent record in MongoDB (no password required)
export const syncUser = async (req, res) => {
  try {
    const { email, name, auth0_id } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const existing = await Parent.findOne({ email });
    if (!existing) {
      // Create a placeholder parent — password is a random hash since Auth0 handles auth
      const hashedPassword = await bcrypt.hash(auth0_id || email, 10);
      await Parent.create({ name: name || email, email, password: hashedPassword });
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get verification status from MongoDB
export const getVerificationStatus = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "User not found" });
    res.json({ isVerified: parent.isVerified ?? false });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark parent as verified
export const setVerified = async (req, res) => {
  try {
    const parent = await Parent.findOneAndUpdate(
      { email: req.user.email },
      { isVerified: true },
      { new: true }
    );
    if (!parent) return res.status(404).json({ message: "User not found" });
    res.json({ isVerified: parent.isVerified });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
