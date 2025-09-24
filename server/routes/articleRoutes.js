import express from "express";
import Article from "../models/Article.js";
import Summary from "../models/Summary.js";

const router = express.Router();

// Internal middleware to protect CREATE route
const internalOnly = (req, res, next) => {
    // Check if request is from internal system
    const internalToken = req.headers['x-internal-token'];
    const expectedToken = process.env.INTERNAL_API_TOKEN;

    if (!internalToken || internalToken !== expectedToken) {
        return res.status(403).json({error: "Forbidden: Internal access only"});
    }
    next();
};
const sampleNews = `Apple Inc. reported record quarterly revenue of $123.9 billion for Q4 2024, beating analyst expectations of $118.5 billion. The tech giant's iPhone sales surged 12% year-over-year, driven by strong demand for the new iPhone 15 Pro models. CEO Tim Cook highlighted the company's expansion into artificial intelligence and services, which now account for 23% of total revenue. Apple's stock price jumped 5.2% in after-hours trading following the earnings announcement. The company also announced a new $90 billion share buyback program and increased its quarterly dividend by 4%. Analysts are optimistic about Apple's AI initiatives and expect continued growth in the services segment throughout 2025.`;

router.post("/", internalOnly, async (req, res, next) => {
    try {
        const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!ALPHA_VANTAGE_API_KEY || !GEMINI_API_KEY) {
            console.log('❌ API keys not found');
            return res.status(500).json({ error: "API keys not configured" });
        }

        // Get today's date
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

        const articles = data.feed.slice(0, 20);
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
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    // text: generateSummaryPrompt(sampleNews)
                                    text: generateSummaryPrompt(combinedSummaries)
                                }]
                            }],
                            generationConfig: {
                                maxOutputTokens: 500,
                                temperature: 0.3,
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
                    throw new Error('Unexpected response format from Gemini API');
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