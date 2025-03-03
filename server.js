const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the News and Summarization API!');
});

// Fetch news articles
app.get('/news/:topic', async (req, res) => {
  const topic = req.params.topic;
  const newsApiKey = ''; // Replace with your NewsAPI key
  try {
    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything?q=${topic}&apiKey=${newsApiKey}`
    );
    const articles = newsResponse.data.articles.slice(0, 5); // Limit to 5 for speed
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Summarize and analyze sentiment
app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  const hfApiKey = ''; // Replace with your Hugging Face API key
  try {
    // Summarization
    const summaryResponse = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      { headers: { Authorization: `Bearer ${hfApiKey}` } }
    );
    const summary = summaryResponse.data[0].summary_text;

    // Sentiment analysis
    const sentimentResponse = await axios.post(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      { inputs: text },
      { headers: { Authorization: `Bearer ${hfApiKey}` } }
    );
    const sentiment = sentimentResponse.data[0][0].label; // e.g., 'POSITIVE', 'NEGATIVE'

    res.json({ summary, sentiment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process article' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
