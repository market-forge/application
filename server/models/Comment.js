import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    summary_date: { 
        type: String, 
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/ // Validate YYYY-MM-DD format
    },
    user_id: { 
        type: String,
        required: true 
    },
    user_name: { 
        type: String, 
        required: true,
        default: 'Anonymous'
    },
    user_email: { 
        type: String, 
        required: true 
    },
    content: { 
        type: String, 
        required: true, 
        maxlength: 500,
        trim: true
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Index for efficient querying
commentSchema.index({ summary_date: 1, created_at: -1 });

const Comment = mongoose.model("Comment", commentSchema, "comments");

export default Comment;