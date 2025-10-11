import express from "express";
import Favorite from "../models/Favorite.js";
import auth from "../middleware/auth.js"; // Make sure this exists

const router = express.Router();

// Apply authentication to all favorite routes
router.use(auth);

// Get all favorites for logged-in user
router.get("/", async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });
    res.json(favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ message: "Server error fetching favorites" });
  }
});

// Add a favorite
router.post("/:articleId", async (req, res) => {
  try {
    const { article } = req.body;
    const { articleId } = req.params;

    if (!article || article._id !== articleId) {
      return res.status(400).json({ message: "Invalid article data" });
    }

    // Check for duplicate
    const existing = await Favorite.findOne({
      userId: req.user.id,
      "article._id": articleId
    });

    if (existing) {
      return res.status(409).json({ message: "Article already in favorites" });
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
router.delete("/:articleId", async (req, res) => {
  try {
    const result = await Favorite.deleteOne({
      userId: req.user.id,
      "article._id": req.params.articleId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ message: "Server error removing favorite" });
  }
});

export default router;