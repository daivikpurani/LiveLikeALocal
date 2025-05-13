import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestResults.css';

const TestResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await axios.get('http://localhost:8000/test-results');
            setResults(response.data.results);
            setSummary(response.data.summary);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch test results');
            setLoading(false);
        }
    };

    if (loading) return <div className="test-results-loading">Loading test results...</div>;
    if (error) return <div className="test-results-error">{error}</div>;

    return (
        <div className="test-results-container">
            <h2>Test Evaluation Results</h2>
            
            {summary && (
                <div className="test-results-summary">
                    <h3>Summary</h3>
                    <div className="summary-stats">
                        <div className="stat">
                            <span>Average Accuracy:</span>
                            <span>{(summary.avgAccuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="stat">
                            <span>Average Relevance:</span>
                            <span>{(summary.avgRelevance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="stat">
                            <span>Overall Score:</span>
                            <span>{(summary.overallScore * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="test-results-list">
                {results.map((result, index) => (
                    <div key={index} className="test-result-item">
                        <div className="result-header">
                            <h4>Query: {result.query}</h4>
                            <div className="result-scores">
                                <span className={`score accuracy ${result.accuracy_score >= 0.7 ? 'good' : result.accuracy_score >= 0.4 ? 'medium' : 'poor'}`}>
                                    Accuracy: {(result.accuracy_score * 100).toFixed(1)}%
                                </span>
                                <span className={`score relevance ${result.relevance_score >= 0.7 ? 'good' : result.relevance_score >= 0.4 ? 'medium' : 'poor'}`}>
                                    Relevance: {(result.relevance_score * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        
                        <div className="result-details">
                            <div className="preferences">
                                <h5>User Preferences:</h5>
                                <pre>{JSON.stringify(JSON.parse(result.preferences), null, 2)}</pre>
                            </div>
                            
                            <div className="response">
                                <h5>LLM Response:</h5>
                                <p>{result.response}</p>
                            </div>
                            
                            {result.feedback && (
                                <div className="feedback">
                                    <h5>Feedback:</h5>
                                    <p>{result.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestResults; 