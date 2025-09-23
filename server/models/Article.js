import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    time_published: { type: String, required: true },
    authors: [String],
    summary: String,
    banner_image: String,
    source: { type: String, required: true },
    category_within_source: String,
    source_domain: String,
    topics: [{
        topic: String,
        relevance_score: String
    }],
    overall_sentiment_score: Number,
    overall_sentiment_label: String,
    ticker_sentiment: [{
        ticker: String,
        relevance_score: String,
        ticker_sentiment_score: String,
        ticker_sentiment_label: String
    }]
});

const Article = mongoose.model("Article", articleSchema, "articles");

export default Article;