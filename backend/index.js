const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routing
const podcastRoutes = require('./routes/podcasts');
app.use('/api/podcasts', podcastRoutes);

// Heartbeat
app.get('/healt', (req, res) => {
    res.status(200).json({ message: 'API gateway is running' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`API gateway is running on port ${PORT}`);
});