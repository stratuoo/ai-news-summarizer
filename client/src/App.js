import React, { useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  const [topic, setTopic] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState({ positive: 0, neutral: 0, negative: 0 });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const newsResponse = await axios.get(`http://localhost:5000/news/${topic}`);
      const articlesData = newsResponse.data;
      const processedArticles = await Promise.all(
        articlesData.map(async (article) => {
          const processResponse = await axios.post('http://localhost:5000/summarize', {
            text: article.content || article.description, // Fallback to description if content is null
          });
          return { ...article, summary: processResponse.data.summary, sentiment: processResponse.data.sentiment };
        })
      );
      setArticles(processedArticles);

      // Calculate sentiment distribution
      const sentimentCounts = processedArticles.reduce((acc, article) => {
        const sentiment = article.sentiment.toLowerCase();
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });
      setSentimentData(sentimentCounts);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI News Summarizer</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic (e.g., AI trends)"
        style={{ padding: '10px', width: '70%', marginRight: '10px' }}
      />
      <button
        onClick={fetchNews}
        disabled={loading}
        style={{ padding: '10px 20px', background: '#007BFF', color: 'white', border: 'none' }}
      >
        {loading ? 'Loading...' : 'Search'}
      </button>
      <div>
        {articles.map((article, index) => (
          <div key={index} style={{ margin: '20px 0', borderBottom: '1px solid #ccc' }}>
            <h3>{article.title}</h3>
            <p><strong>Summary:</strong> {article.summary}</p>
            <p><strong>Sentiment:</strong> {article.sentiment}</p>
          </div>
        ))}
      </div>
      {articles.length > 0 && (
        <div>
          <h2>Sentiment Distribution</h2>
          <Pie
            data={{
              labels: ['Positive', 'Neutral', 'Negative'],
              datasets: [{
                data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
            height={300}
          />
        </div>
      )}
    </div>
  );
}

export default App;