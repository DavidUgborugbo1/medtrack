const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');

const app = express();
//Middle ware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);

//Test Routes
app.get('/', (req, res) => {
  res.json({ message: 'MedTrack API is running!' });
});

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});