// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workerRoutes = require('./routes/workerRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testRoutes = require('./routes/testRoutes');
const topicRoutes = require('./routes/topicRoutes');
const jobRoutes = require('./routes/jobRoutes'); // FIX: This line was missing
const errorHandler = require('./middleware/errorHandler');

require('./utils/queue');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); 

// Health Check for Render
app.get('/health', (req, res) => res.status(200).send('Server is healthy'));

// Connect to MongoDB
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/topics', topicRoutes); 
app.use('/api/jobs', jobRoutes); // FIX: This line was missing

// Error Handling Middleware
app.use(errorHandler);

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));