import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Also check for token in localStorage (from frontend)
        const tokenFromBody = req.headers['x-auth-token'];
        if (!tokenFromBody) {
            return res.status(401).json({ error: 'Access token required' });
        }
        
        jwt.verify(tokenFromBody, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// GET /api/profile - Get current user profile
router.get("/", authenticateToken, async (req, res, next) => {
    try {
        // console.log('Getting profile for user ID:', req.user.id);
        
        const user = await User.findById(req.user.id).select('-__v');
        if (!user) {
            console.log('User not found for ID:', req.user.id);
            return res.status(404).json({ error: 'User not found' });
        }
        
        // console.log('Found user:', user.email);
        res.json(user);
    } catch (error) {
        console.error('Error getting profile:', error);
        next(error);
    }
});

// PUT /api/profile - Update user profile
router.put("/", authenticateToken, async (req, res, next) => {
    try {
        // console.log('Updating profile for user ID:', req.user.id);
        // console.log('Update data:', req.body);
        
        const allowedUpdates = [
            'bio', 'date_of_birth', 'phone', 'location', 'website', 
            'company', 'job_title', 'investment_experience', 'risk_tolerance', 
            'interested_sectors', 'profile_visibility', 'email_notifications'
        ];
        
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // console.log('Filtered updates:', updates);

        const user = await User.findByIdAndUpdate(
            req.user.id, 
            updates, 
            { new: true, runValidators: true }
        ).select('-__v');

        if (!user) {
            // console.log('User not found for update, ID:', req.user.id);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Profile updated successfully');
        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

export default router;