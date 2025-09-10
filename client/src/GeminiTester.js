import { useState } from 'react';

export default function GeminiTester() {
    const [apiKey, setApiKey] = useState('');
    const [newsText, setNewsText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Sample news text for testing
    const sampleNews = `Apple Inc. reported record quarterly revenue of $123.9 billion for Q4 2024, beating analyst expectations of $118.5 billion. The tech giant's iPhone sales surged 12% year-over-year, driven by strong demand for the new iPhone 15 Pro models. CEO Tim Cook highlighted the company's expansion into artificial intelligence and services, which now account for 23% of total revenue. Apple's stock price jumped 5.2% in after-hours trading following the earnings announcement. The company also announced a new $90 billion share buyback program and increased its quarterly dividend by 4%. Analysts are optimistic about Apple's AI initiatives and expect continued growth in the services segment throughout 2025.`;

    const testGeminiAPI = async () => {
        if (!apiKey.trim()) {
            setError('Please enter your Gemini API key');
            return;
        }

        if (!newsText.trim()) {
            setError('Please enter some news text to summarize');
            return;
        }

        setLoading(true);
        setError('');
        setSummary('');

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are a financial news analyst. Summarize this news article focusing on:
1. Key financial metrics and performance
2. Market impact and stock movement
3. Strategic implications
4. Investment relevance

Keep the summary concise but informative (2-3 paragraphs):

${newsText}`
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 500,
                            temperature: 0.3,
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                setSummary(data.candidates[0].content.parts[0].text);
            } else {
                throw new Error('Unexpected response format from Gemini API');
            }

        } catch (err) {
            console.error('Gemini API Error:', err);
            setError(`API Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadSampleNews = () => {
        setNewsText(sampleNews);
        setError('');
    };

    const clearAll = () => {
        setNewsText('');
        setSummary('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        🚀 Gemini API Tester
                    </h1>
                    <p className="text-gray-600 mb-6">Test your Gemini API key with financial news summarization</p>

                    {/* API Key Input */}
                    <div className="mb-6">
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                        </p>
                    </div>

                    {/* News Text Input */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="newsText" className="block text-sm font-medium text-gray-700">
                                News Article Text
                            </label>
                            <div className="space-x-2">
                                <button
                                    onClick={loadSampleNews}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                                >
                                    Load Sample
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors text-red-700"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                        <textarea
                            id="newsText"
                            value={newsText}
                            onChange={(e) => setNewsText(e.target.value)}
                            placeholder="Paste your news article here or click 'Load Sample' to test with sample data..."
                            rows={8}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Character count: {newsText.length}
                        </p>
                    </div>

                    {/* Test Button */}
                    <button
                        onClick={testGeminiAPI}
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-98'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Summary...
              </span>
                        ) : (
                            '✨ Generate Summary with Gemini'
                        )}
                    </button>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-red-600 text-xl mr-2">❌</span>
                                <div>
                                    <h3 className="text-red-800 font-medium">Error</h3>
                                    <p className="text-red-700 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Display */}
                    {summary && (
                        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-green-800 font-medium mb-3 flex items-center">
                                <span className="text-green-600 text-xl mr-2">✅</span>
                                AI-Generated Summary
                            </h3>
                            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {summary}
                            </div>
                            <div className="mt-4 text-xs text-green-600">
                                Summary generated successfully! Your Gemini API key is working. 🎉
                            </div>
                        </div>
                    )}

                    {/* API Info */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-blue-800 font-medium mb-2">📊 API Information</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p><strong>Model:</strong> gemini-1.5-flash-latest</p>
                            <p><strong>Free Tier:</strong> 1,500 requests/day</p>
                            <p><strong>Max Output:</strong> 500 tokens</p>
                            <p><strong>Temperature:</strong> 0.3 (focused responses)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}