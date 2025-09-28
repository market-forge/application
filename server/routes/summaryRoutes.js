import express from "express";
import Summary from "../models/Summary.js";

const router = express.Router();

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

export default router;