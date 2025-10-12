import express from "express";
import mongoose from "mongoose";
import Article from "../models/Article.js";
import Summary from "../models/Summary.js";
import cronSummaries from "../middleware/cronSummaries.js";

const router = express.Router();

// GET /api/articles/:date - Fetch articles by date
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

        // Find articles for the specified date
        // Assuming time_published format is like "20250923T123000"
        const articles = await Article.find({
            time_published: { $regex: `^${date}` }
        }).sort({ time_published: -1 });
        
        res.json(articles);

    } catch (error) {
        console.error('Error fetching articles:', error.message);
        next(error);
    }
});

// GET /api/articles/combined/:date - Fetch both summary and articles for a date
router.get("/combined/:date", async (req, res, next) => {
    try {
        const { date } = req.params;
        
        // Validate date format (YYYYMMDD)
        if (!/^\d{8}$/.test(date)) {
            return res.status(400).json({
                error: "Invalid date format. Use YYYYMMDD (e.g., 20250923)"
            });
        }

        // Fetch both summary and articles concurrently
        const [summary, articles] = await Promise.all([
            Summary.findOne({ date: { $regex: `^${date}` } }),
            Article.find({ time_published: { $regex: `^${date}` } })
                .sort({ time_published: -1 })
        ]);
        
        res.json({
            date,
            summary: summary ? {
                combined_summary: summary.combined_summary,
                created_at: summary.created_at
            } : null,
            articles,
            total_articles: articles.length
        });

    } catch (error) {
        console.error('Error fetching combined data:', error.message);
        next(error);
    }
});

// GET /api/articles/id/:id - Fetch article by ID
router.get("/id/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid article ID format"
            });
        }

        // Find article by ID
        const article = await Article.findById(id);
        
        if (!article) {
            return res.status(404).json({
                error: "Article not found"
            });
        }
        
        res.json(article);

    } catch (error) {
        console.error('Error fetching article by ID:', error.message);
        next(error);
    }
});

const sampleNews = `Apple Inc. reported record quarterly revenue of $123.9 billion for Q4 2024, beating analyst expectations of $118.5 billion. The tech giant's iPhone sales surged 12% year-over-year, driven by strong demand for the new iPhone 15 Pro models. CEO Tim Cook highlighted the company's expansion into artificial intelligence and services, which now account for 23% of total revenue. Apple's stock price jumped 5.2% in after-hours trading following the earnings announcement. The company also announced a new $90 billion share buyback program and increased its quarterly dividend by 4%. Analysts are optimistic about Apple's AI initiatives and expect continued growth in the services segment throughout 2025.`;

router.post("/", cronSummaries, async (req, res, next) => {
    try {
        const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!ALPHA_VANTAGE_API_KEY || !GEMINI_API_KEY) {
            console.log('❌ API keys not found');
            return res.status(500).json({ error: "API keys not configured" });
        }

        // Get today's date
        // const currentDay = 20251006;
        const currentDay = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // 🔎 Check if a summary already exists for this day
        const existingSummary = await Summary.findOne({
            date: { $regex: `^${currentDay}` } // matches 20250923*
        });

        if (existingSummary) {
            console.log('⏩ Summary already exists for date:', currentDay);
            return res.status(200).json({
                combined_summary: existingSummary.combined_summary,
                skipped: true
            });
        }

        console.log('📅 Fetching news for date:', currentDay);

        // Build Alpha Vantage API URL with limit=50
        const topics = 'financial_markets';
        const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&time_from=${currentDay}T0000&time_to=${currentDay}T2359&limit=50&sort=LATEST&apikey=${ALPHA_VANTAGE_API_KEY}`;

        console.log('🌐 Making API call to Alpha Vantage...');

        const response = await fetch(url);
        const data = await response.json();

        console.log('📊 API Response Status:', response.status);
        console.log('📈 Data keys:', Object.keys(data));

        if (!data.feed || data.feed.length === 0) {
            console.log('❌ No articles found in feed');
            return res.status(200).json({
                combined_summary: ''
            });
        }

        console.log('📰 Total articles found:', data.feed.length);
        console.log('Slicing articles...');

        const articles = data.feed.slice(0, 10);
        // Log first article details
        const firstArticle = articles[0];
        console.log('\n--- FIRST ARTICLE SAMPLE ---');
        console.log('Title:', firstArticle.title);
        console.log('Summary:', firstArticle.summary?.substring(0, 100) + '...');
        console.log('URL:', firstArticle.url);
        console.log('Published:', firstArticle.time_published);
        console.log('Overall Sentiment:', firstArticle.overall_sentiment_label);
        console.log('Sentiment Score:', firstArticle.overall_sentiment_score);
        console.log('Topics:', firstArticle.topics);
        console.log('Tickers:', firstArticle.ticker_sentiment?.map(ts => ts.ticker));
        console.log('--- END SAMPLE ---\n');

        // Combine all summaries for Gemini
        const combinedSummaries = articles
            .filter(article => article.summary)
            .map(article => article.summary)
            .join('\n\n');

        let geminiSummary = '';

        if (combinedSummaries.trim()) {
            console.log('📝 Generating combined summary with Gemini API...');
            try {
                const geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: generateSummaryPrompt(combinedSummaries)
                                }]
                            }],
                            generationConfig: {
                                maxOutputTokens: 2000,
                                temperature: 0.3,
                                thinkingConfig: {
                                    thinkingBudget: 0
                                }
                            }
                        })
                    }
                );

                if (!geminiResponse.ok) {
                    const errorData = await geminiResponse.json();
                    throw new Error(errorData.error?.message || `HTTP ${geminiResponse.status}`);
                }

                const geminiData = await geminiResponse.json();
                if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
                    geminiSummary = geminiData.candidates[0].content.parts[0].text;
                } else {
                    throw new Error(`Unexpected response format from Gemini API: ${JSON.stringify(geminiData)}`);
                }
            } catch (err) {
                console.error('💥 Gemini API Error:', err.message);
                // Continue with default summary
            }
        } else {
            console.log('⚠️ No valid summaries to process with Gemini');
        }

        if (geminiSummary && geminiSummary.trim()) {
            console.log('💾 Saving articles & summary to MongoDB...');

            // Save articles
            try {
                await Article.insertMany(articles.map(article => ({
                    title: article.title,
                    url: article.url,
                    time_published: article.time_published,
                    authors: article.authors || [],
                    summary: article.summary || '',
                    banner_image: article.banner_image || '',
                    source: article.source,
                    category_within_source: article.category_within_source || '',
                    source_domain: article.source_domain || '',
                    topics: article.topics || [],
                    overall_sentiment_score: article.overall_sentiment_score,
                    overall_sentiment_label: article.overall_sentiment_label,
                    ticker_sentiment: article.ticker_sentiment || []
                })), { ordered: false }); // ordered:false → continue if duplicates
                console.log('✅ Articles saved');
            } catch (err) {
                console.error('⚠️ Error saving articles:', err.message);
            }

            // Save combined summary
            try {
                await Summary.create({
                    date: firstArticle.time_published,
                    combined_summary: geminiSummary
                });
                console.log('✅ Summary saved');
            } catch (err) {
                console.error('⚠️ Error saving summary:', err.message);
            }

            return res.json({ combined_summary: geminiSummary });
        } else {
            console.log('⚠️ No Gemini summary generated, skipping save.');
            return res.json({ combined_summary: '' });
        }

    } catch (error) {
        console.error('💥 Error fetching news:', error.message);
        res.status(500).json({
            error: error.message
        });
    }
});

const generateSummaryPrompt = (combinedSummaries) => {
    return `You are a financial news analyst. Summarize the following collection of financial news summaries, focusing on:
1. Key financial metrics and performance across the market
2. Market impact and stock movements
3. Strategic implications for industries or companies
4. Investment relevance for portfolio decisions

Keep the summary concise but informative (2-3 paragraphs):

${combinedSummaries}`;
};

export default router;