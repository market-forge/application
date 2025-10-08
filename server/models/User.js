import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Basic info from Google OAuth
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    
    // Additional Google OAuth fields
    given_name: String,
    family_name: String,
    picture: String, // Google profile picture URL
    locale: String,
    
    // Extended profile fields
    bio: { type: String, maxlength: 500, default: "" },
    date_of_birth: Date,
    phone: String,
    location: String,
    website: String,
    company: String,
    job_title: String,
    
    // Investment preferences
    investment_experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },
    risk_tolerance: {
        type: String,
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate'
    },
    interested_sectors: [{
        type: String,
        enum: ['technology', 'healthcare', 'finance', 'energy', 'real_estate', 'commodities', 'crypto']
    }],
    
    // Profile settings
    profile_visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    email_notifications: { type: Boolean, default: true },
    
    // System fields
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    last_login: Date,
    
    // Legacy field (keeping for compatibility)
    age: Number
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

const User = mongoose.model("User", userSchema, "users");

export default User;
