// backend/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { submitTest, getScoreboard } = require('../controllers/testController'); // Assuming getScoreboard is the correct name
// Import updateTestAttemptProgress from questionController, as it's not specific to 'tests' in general
const { updateTestAttemptProgress } = require('../controllers/questionController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment and use if you have an auth middleware

// Test submission
router.post('/submit/:testAttemptId', submitTest);

// Get scoreboard scores
router.get('/scores', getScoreboard); // Assuming getScoreboard is used here

// Route to update test attempt progress (current question index and start time)
router.put('/progress', updateTestAttemptProgress); // This route remains here as it updates a test attempt

module.exports = router;
