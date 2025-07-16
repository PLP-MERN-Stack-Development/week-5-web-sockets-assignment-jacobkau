// routes/books.js or inside server.js
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'plp_bookstore';

router.get('/api/books', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = await db.collection('books').find({}).toArray();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch books');
  }
});

module.exports = router;
