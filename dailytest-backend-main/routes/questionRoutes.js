// backend/routes/questionRoutes.js
const express = require('express');
const {
    generateAndStoreQuestions,
    getQuestionsForTest,
    getAllQuestions,
    updateQuestion,
    deleteQuestion,
    validateTopics,
    getQuestionStats,
    retryFailedGeneration
} = require('../controllers/questionController');
const router = express.Router();

// --- All POST routes ---
router.post('/generate', generateAndStoreQuestions);
router.post('/validate-topics', validateTopics);
router.post('/retry', retryFailedGeneration);

// --- All GET routes ---
router.get('/stats', getQuestionStats);
router.get('/:workerId', getQuestionsForTest);
router.get('/', getAllQuestions);

// --- All PUT/DELETE routes ---
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;