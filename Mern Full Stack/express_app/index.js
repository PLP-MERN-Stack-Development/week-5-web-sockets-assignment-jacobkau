// index.js
const express = require('express');
const path = require('path');
const { swaggerUi, specs } = require('./swagger');
const booksRoute = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the portfolio HTML page
app.use(express.static(path.join(__dirname, 'public')));
app.use(booksRoute);
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /portfolio:
 *   get:
 *     summary: Serve the portfolio HTML
 *     description: Returns the static portfolio HTML page.
 *     responses:
 *       200:
 *         description: HTML page served
 */
app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portfolio.html'));
});

// GET /books/summary - average price by genre
app.get('/books/summary', async (req, res) => {
  try {
    const result = await db.collection('books').aggregate([
      {
        $group: {
          _id: "$genre",
          averagePrice: { $avg: "$price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { averagePrice: -1 } }
    ]).toArray();

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Aggregation error", details: err.message });
  }
});


app.use(express.json());

app.post('/books', async (req, res) => {
  try {
    const newBook = req.body;
    const result = await db.collection('books').insertOne(newBook);
    res.status(201).json({ message: "Book added", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Insert failed", details: err.message });
  }
});

app.get('/books/search', async (req, res) => {
  const q = req.query.q || '';
  const regex = new RegExp(q, 'i'); // case-insensitive

  try {
    const books = await db.collection('books').find({
      $or: [
        { title: regex },
        { author: regex },
        { genre: regex }
      ]
    }).toArray();

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}/portfolio`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
