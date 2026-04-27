// backend/routes/topicRoutes.js
const express = require('express');
const router = express.Router();
const { 
    submitTopic, 
    getWeeklyTopicsForWorker, // Use the new, more specific function
    checkTopicForToday 
} = require('../controllers/topicController');

// Route for workers to submit their daily topic
router.post('/', submitTopic);

// Route for checking if a worker has submitted a topic today
router.post('/check', checkTopicForToday);

// MODIFIED: This route now accepts a workerId to fetch specific topics
router.get('/weekly/:workerId', getWeeklyTopicsForWorker);

module.exports = router;