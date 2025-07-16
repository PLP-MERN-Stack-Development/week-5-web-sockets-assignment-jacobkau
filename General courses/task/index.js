const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes'); // Import the routes

const app = express();
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/taskdb'; // Replace with your MongoDB URI
const PORT = 3000;
 
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then (() => {console.log('MongoDB connected');}).catch(err => {console.error('MongoDB connection error:', err);});

app.use('/', taskRoutes); // Use the task routes

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
