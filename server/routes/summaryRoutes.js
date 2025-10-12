import express from "express";
import Summary from "../models/Summary.js";
import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// GET /api/summaries/:date - Fetch summary by date
// Date format: YYYYMMDD (e.g., 20250923)
router.get("/:date", async (req, res, next) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYYMMDD)
        if (!/^\d{8}$/.test(date)) {
            return res.status(400).json({
                error: "Invalid date format. Use YYYYMMDD (e.g., 20250923)"
            });
        }

        // Find summary for the specified date
        const summary = await Summary.findOne({
            date: { $regex: `^${date}` } // matches 20250923*
        });

        if (!summary) {
            return res.status(404).json({
                error: "Summary not found for the specified date"
            });
        }
        
        res.json({
            date: summary.date,
            combined_summary: summary.combined_summary,
            created_at: summary.created_at
        });

    } catch (error) {
        console.error('Error fetching summary:', error.message);
        next(error);
    }
});

// GET /api/summaries - Get all summaries (optional, for listing)
router.get("/", async (req, res, next) => {
    try {
        const summaries = await Summary.find()
            .sort({ created_at: -1 })
            .limit(30); // Limit to last 30 summaries

        res.json(summaries);
    } catch (error) {
        console.error('Error fetching summaries:', error.message);
        next(error);
    }
});

// GET /api/summaries/:date/comments - Get all comments for a summary
router.get("/:date/comments", async (req, res, next) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                error: "Invalid date format. Use YYYY-MM-DD (e.g., 2025-09-23)"
            });
        }
        
        const comments = await Comment.find({ summary_date: date })
            .sort({ created_at: -1 })
            .limit(100);
        
        res.json(comments);
    } catch (error) {
        console.error('💥 Error fetching comments:', error);
        next(error);
    }
});


// POST /api/summaries/:date/comments - Add a comment to a summary
router.post("/:date/comments", authenticateToken, async (req, res, next) => {
    try {        
        const { date } = req.params;
        const { content } = req.body;
        
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                error: "Invalid date format. Use YYYY-MM-DD (e.g., 2025-09-23)"
            });
        }

        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({
                error: "Comment content is required"
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                error: "Comment cannot exceed 500 characters"
            });
        }

        // Check if user data exists
        if (!req.user || !req.user.id) {
            return res.status(400).json({
                error: "Invalid user data in token"
            });
        }

        // Create new comment
        const comment = await Comment.create({
            summary_date: date,
            user_id: req.user.id,
            user_name: req.user.name || req.user.full_name || 'Anonymous',
            user_email: req.user.email,
            content: content.trim()
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('💥 Error creating comment:', error);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Duplicate comment detected' });
        }
        next(error);
    }
});

export default router;