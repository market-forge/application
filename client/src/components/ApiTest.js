import React, { useState } from 'react';
import ApiService from '../services/api.js';

const ApiTest = () => {
    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(false);

    const runTests = async () => {
        setTesting(true);
        const results = {};
        const testDate = '2025-09-23'; // Use a test date

        // Test 1: Connection
        try {
            results.connection = await ApiService.testConnection();
        } catch (error) {
            results.connection = false;
            results.connectionError = error.message;
        }

        // Test 2: All summaries
        try {
            const summaries = await ApiService.getAllSummaries();
            results.summaries = `Found ${summaries.length} summaries`;
        } catch (error) {
            results.summariesError = error.message;
        }

        // Test 3: Combined data
        try {
            const combined = await ApiService.getCombinedDataByDate(testDate);
            results.combined = `Summary: ${combined.summary ? 'Yes' : 'No'}, Articles: ${combined.articles?.length || 0}`;
        } catch (error) {
            results.combinedError = error.message;
        }

        // Test 4: Individual summary
        try {
            const summary = await ApiService.getSummaryByDate(testDate);
            results.summary = 'Summary found';
        } catch (error) {
            results.summaryError = error.message;
        }

        // Test 5: Individual articles
        try {
            const articles = await ApiService.getArticlesByDate(testDate);
            results.articles = `Found ${articles.length} articles`;
        } catch (error) {
            results.articlesError = error.message;
        }

        setTestResults(results);
        setTesting(false);
    };

    return (
        <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            margin: '20px 0', 
            borderRadius: '10px',
            border: '1px solid #dee2e6'
        }}>
            <h3>API Connection Test</h3>
            <button 
                onClick={runTests} 
                disabled={testing}
                style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: testing ? 'not-allowed' : 'pointer',
                    marginBottom: '15px'
                }}
            >
                {testing ? 'Testing...' : 'Run API Tests'}
            </button>

            {Object.keys(testResults).length > 0 && (
                <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6'
                }}>
                    <strong>Test Results:</strong><br/>
                    {Object.entries(testResults).map(([key, value]) => (
                        <div key={key} style={{ 
                            color: key.includes('Error') ? 'red' : 'green',
                            marginBottom: '5px'
                        }}>
                            {key}: {value.toString()}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApiTest;
