// backend/routes/workerRoutes.js
const express = require('express');
const { createWorker, getWorkers, getWorkerById, updateWorker, deleteWorker } = require('../controllers/workerController');
const router = express.Router();

router.route('/')
    .post(createWorker)
    .get(getWorkers);

router.route('/:id')
    .get(getWorkerById)
    .put(updateWorker)
    .delete(deleteWorker);

module.exports = router;