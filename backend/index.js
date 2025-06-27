const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// In-memory storage for quotes
let quotes = [];

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('🚀 Quote Keeper Backend is Live');
  });

  
app.get('/quotes', (req, res) => {
  res.json(quotes);
});

app.post('/quotes', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required.' });
  }

  const newQuote = { id: Date.now(), author, text };
  quotes.push(newQuote);
  res.status(201).json(newQuote);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
