import express from "express";
import Favorite from "../models/Favorite.js";
import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();

// Get all favorites for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });
    res.json(favorites); // ✅ return plain array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a favorite
router.post("/:articleId", verifyToken, async (req, res) => {
  try {
    const { article } = req.body;

    if (!article || !req.params.articleId) {
      return res.status(400).json({ message: "Missing article data" });
    }

    const favorite = new Favorite({
      userId: req.user.id,
      article,
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(400).json({ message: err.message });
  }
});

// Remove a favorite
router.delete("/:articleId", verifyToken, async (req, res) => {
  try {
    await Favorite.deleteOne({
      userId: req.user.id,
      "article._id": req.params.articleId,
    });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
