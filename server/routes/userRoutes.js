// Sample routes for operating CRUD on User table
import express from "express";
import User from "../models/User.js";

const router = express.Router();
// For 'write' operations, mongoose checks if the collection was already created (and not just prepared)
// If not, it creates it first

// CREATE
router.post("/", async (req, res, next) => {
  try {
    const user = await User.create(req.body); // { name: "Alice", email: "alice@example.com", age: 25 }
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// READ
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// READ BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// UPDATE
router.put("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); // { email: "alice@example.com" }, { age: 26 },
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); // { email: "alice@example.com" }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;