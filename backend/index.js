const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Quote Keeper Backend is Live');
});

// GET /quotes with optional pagination and search
app.get('/quotes', (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const searchQuery = `%${search}%`;

  db.all(
    `SELECT * FROM quotes WHERE author LIKE ? OR text LIKE ? LIMIT ? OFFSET ?`,
    [searchQuery, searchQuery, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Get total count for pagination
      db.get(
        `SELECT COUNT(*) as count FROM quotes WHERE author LIKE ? OR text LIKE ?`,
        [searchQuery, searchQuery],
        (err, countResult) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({
            data: rows,
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.count,
          });
        }
      );
    }
  );
});

// POST /quotes to add a new quote
app.post('/quotes', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required.' });
  }

  const sql = 'INSERT INTO quotes (author, text) VALUES (?, ?)';
  const params = [author, text];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, author, text });
  });
});

// PUT /quotes/:id to update a quote
app.put('/quotes/:id', (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required.' });
  }

  const sql = 'UPDATE quotes SET author = ?, text = ? WHERE id = ?';
  const params = [author, text, id];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ id: parseInt(id), author, text });
  });
});

// DELETE /quotes/:id to delete a quote
app.delete('/quotes/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM quotes WHERE id = ?';
  db.run(sql, id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
