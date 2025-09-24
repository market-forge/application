import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
    date: { type: String, required: true },
    combined_summary: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const Summary = mongoose.model('Summary', summarySchema, 'summaries');

export default Summary;