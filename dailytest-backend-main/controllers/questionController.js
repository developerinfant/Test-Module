// backend/controllers/questionController.js
const { v4: uuidv4 } = require('uuid');
const jobManager = require('../utils/jobManager');
const { processQuestionGeneration } = require('../utils/questionProcessor');
const Question = require('../models/Question');
const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');
const LearningTopic = require('../models/LearningTopic');
const validator = require('validator');
const { generateMCQQuestions } = require('../utils/openai');

// Simple logging utility
const log = {
    info: (message, data = {}) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    },
    error: (message, error = {}) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    },
    warn: (message, data = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
    }
};

// Default fallback topics for employees without specific topics
const DEFAULT_FALLBACK_TOPICS = [
    'General Knowledge',
    'Problem Solving',
    'Communication Skills'
];

// Constants for batch processing and retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY = 1500; // Start with 1.5 seconds

// Input validation middleware
const validateQuestionGeneration = (req, res, next) => {
    const { workerIds, numQuestions, topic, individualTopics, topicMode } = req.body;

    if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
        return res.status(400).json({ message: 'At least one employee must be selected' });
    }
    if (workerIds.length > 100) {
        return res.status(400).json({ message: 'Maximum 100 employees per request for performance reasons' });
    }
    for (const id of workerIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: `Invalid worker ID format: ${id}`
            });
        }
    }
    const numQuestionsInt = parseInt(numQuestions);
    if (isNaN(numQuestionsInt) || numQuestionsInt < 1 || numQuestionsInt > 100) {
        return res.status(400).json({
            message: 'Number of questions must be between 1 and 100'
        });
    }
    
    // For common mode, we only generate questions once, so the limit is different
    if (topicMode === 'common') {
        if (numQuestionsInt * workerIds.length > 5000) {
            return res.status(400).json({
                message: `Enterprise limit: Maximum 5000 total questions per request. You requested ${workerIds.length} × ${numQuestionsInt} = ${workerIds.length * numQuestionsInt} questions. Please reduce the number of employees or questions per employee.`
            });
        }
        if (numQuestionsInt * workerIds.length > 1500) {
            log.warn(`🏢 LARGE ENTERPRISE REQUEST: ${workerIds.length} workers × ${numQuestionsInt} questions = ${workerIds.length * numQuestionsInt} total questions`);
        }
    } else {
        // For individual mode, each worker gets their own set of questions
        if (workerIds.length * numQuestionsInt > 5000) {
            return res.status(400).json({
                message: `Enterprise limit: Maximum 5000 total questions per request. You requested ${workerIds.length} × ${numQuestionsInt} = ${workerIds.length * numQuestionsInt} questions. Please reduce the number of employees or questions per employee.`
            });
        }
        if (workerIds.length * numQuestionsInt > 1500) {
            log.warn(`🏢 LARGE ENTERPRISE REQUEST: ${workerIds.length} workers × ${numQuestionsInt} questions = ${workerIds.length * numQuestionsInt} total questions`);
        }
    }
    
    if (topic && /<script|javascript:|on\w+=/i.test(topic)) {
        return res.status(400).json({
            message: 'Invalid characters in topic'
        });
    }
    if (individualTopics) {
        for (const [workerId, topics] of Object.entries(individualTopics)) {
            if (!Array.isArray(topics)) {
                return res.status(400).json({
                    message: 'Individual topics must be arrays'
                });
            }
            for (const t of topics) {
                if (/<script|javascript:|on\w+=/i.test(t)) {
                    return res.status(400).json({
                        message: 'Invalid characters in topics'
                    });
                }
            }
        }
    }
    next();
};

// Retry logic for AI generation
const generateWithRetry = async (topic, count, difficulty, maxRetries = MAX_RETRIES) => {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            log.info(`Attempt ${attempt + 1} to generate questions for topic: ${topic}`);
            const questionsObject = await generateMCQQuestions([topic], count, difficulty);
            const questions = questionsObject[topic];
            if (questions && questions.length > 0) {
                return questions;
            }
            throw new Error('No questions were returned from the AI for this topic.');
        } catch (error) {
            lastError = error;
            log.error(`Attempt ${attempt + 1} failed:`, error.message);
            if (attempt < maxRetries - 1) {
                const delay = RETRY_DELAY * Math.pow(2, attempt);
                log.info(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`Failed after ${maxRetries} attempts for topic "${topic}": ${lastError.message}`);
};

// @desc    Generate and store questions for multiple workers
// @route   POST /api/questions/generate
// @access  Private/Admin
const generateAndStoreQuestions = [
    validateQuestionGeneration,
    async (req, res) => {
        const jobId = uuidv4();
        jobManager.createJob(jobId);

        // Immediately respond to the client with a job ID
        res.status(202).json({
            message: "Question generation process has been started.",
            jobId: jobId
        });

        // Start the generation process in the background without awaiting it.
        // This frees up the server to handle other requests.
        processQuestionGeneration(req.body, jobId).catch(err => {
            console.error(`Job ${jobId} failed catastrophically:`, err);
            jobManager.failJob(jobId, err.message || 'An unexpected error occurred during processing.');
        });
    }
];

// @desc    Get questions for a specific worker's test session
// @route   GET /api/questions/:workerId
// @access  Private/Worker
const getQuestionsForTest = async (req, res, next) => {
    const { workerId } = req.params;
    
    try {
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found or not authorized.' });
        }

        const latestQuestionEntry = await Question.findOne({ worker: workerId })
            .sort({ createdAt: -1 })
            .select('topic timeDuration totalTestDuration isDefaultTopic')
            .lean();

        if (!latestQuestionEntry) {
            return res.status(404).json({ message: 'No questions found for this employee yet. Please contact your admin.' });
        }
        const latestTopic = latestQuestionEntry.topic;
        const defaultDurationPerQuestion = latestQuestionEntry.timeDuration || 15;
        const totalDuration = latestQuestionEntry.totalTestDuration || 600;
        const isDefaultTopic = latestQuestionEntry.isDefaultTopic || false;

        const existingCompletedAttempt = await TestAttempt.findOne({
            worker: workerId,
            topic: latestTopic,
            status: 'completed'
        });

        if (existingCompletedAttempt) {
            return res.status(403).json({ 
                message: `You have already completed the test for the topic "${latestTopic}".` 
            });
        }
        
        let testAttempt = await TestAttempt.findOne({
            worker: workerId,
            topic: latestTopic,
            status: 'in-progress'
        });

        let questions;
        if (!testAttempt) {
            questions = await Question.find({ worker: workerId, topic: latestTopic });

            if (questions.length === 0) {
                return res.status(404).json({ 
                    message: `No questions found for the latest topics for this employee.` 
                });
            }

            const shuffledQuestionIds = questions.sort(() => 0.5 - Math.random()).map(q => q._id);

            testAttempt = await TestAttempt.create({
                worker: workerId,
                topic: latestTopic,
                questions: shuffledQuestionIds,
                durationPerQuestion: defaultDurationPerQuestion,
                totalTestDuration: totalDuration,
                status: 'in-progress',
                currentQuestionIndex: 0,
                testStartTime: Date.now(),
                questionStartTime: Date.now(),
                isDefaultTopic: isDefaultTopic
            });
            
            log.info(`New test attempt created with ID: ${testAttempt._id}`);

        } else {
            questions = await Question.find({ '_id': { $in: testAttempt.questions } });
            questions.sort((a, b) => testAttempt.questions.indexOf(a._id) - testAttempt.questions.indexOf(b._id));

            log.info(`Resuming test attempt with ID: ${testAttempt._id}`);
        }

        const questionsToSend = questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctAnswer,
            timeDuration: q.timeDuration
        }));

        res.json({
            testAttemptId: testAttempt._id,
            questions: questionsToSend,
            currentQuestionIndex: testAttempt.currentQuestionIndex,
            questionStartTime: testAttempt.questionStartTime,
            durationPerQuestion: testAttempt.durationPerQuestion,
            totalTestDuration: testAttempt.totalTestDuration,
            testStartTime: testAttempt.testStartTime,
            status: testAttempt.status,
            latestTopic: latestTopic,
            isDefaultTopic: isDefaultTopic,
            notification: isDefaultTopic 
                ? 'Note: This test uses default general topics as no specific topics were assigned to you.' 
                : null
        });

    } catch (error) {
        log.error("Error in getQuestionsForTest:", error);
        res.status(500).json({ message: 'Server error while fetching test questions.' });
    }
};

// @desc    Update test attempt progress
// @route   PUT /api/questions/progress
// @access  Private/Worker
const updateTestAttemptProgress = async (req, res, next) => {
    try {
        const { testAttemptId, currentQuestionIndex, questionStartTime } = req.body;
        const testAttempt = await TestAttempt.findById(testAttemptId);
        if (!testAttempt) {
            return res.status(404).json({ message: 'Test attempt not found.' });
        }
        if (testAttempt.status === 'completed') {
            return res.status(400).json({ message: 'This test has already been submitted and cannot be updated.' });
        }
        if (testAttempt.status === 'in-progress') {
            testAttempt.currentQuestionIndex = currentQuestionIndex;
            testAttempt.questionStartTime = questionStartTime;
            await testAttempt.save();
            res.status(200).json({ message: 'Test progress updated successfully.', testAttempt });
        } else {
            res.status(400).json({ message: 'Test attempt is not in progress.' });
        }
    } catch (error) {
        log.error("Error in updateTestAttemptProgress:", error);
        next(error);
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res, next) => {
    const { id } = req.params;
    const { questionText, options, correctAnswer, topic, difficulty, timeDuration, totalTestDuration } = req.body;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        if (questionText) question.questionText = questionText;
        if (options && Array.isArray(options) && options.length === 4) {
            question.options = options;
        } else if (options) {
            return res.status(400).json({ message: 'Options must be an array of exactly 4 strings.' });
        }
        if (correctAnswer !== undefined && options) {
            const correctOptionIndex = options.findIndex(
                (opt) => String(opt).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
            );
            if (correctOptionIndex === -1) {
                return res.status(400).json({ message: 'Correct answer must be one of the provided options.' });
            }
            question.correctAnswer = correctOptionIndex;
        }
        if (topic) question.topic = topic;
        if (difficulty) question.difficulty = difficulty;
        if (timeDuration) question.timeDuration = parseInt(timeDuration, 10);
        if (totalTestDuration) question.totalTestDuration = parseInt(totalTestDuration, 10);
        const updatedQuestion = await question.save();
        res.status(200).json({ message: 'Question updated successfully!', question: updatedQuestion });
    } catch (error) {
        log.error("Error in updateQuestion:", error);
        next(error);
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res, next) => {
    const { id } = req.params;
    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        await question.deleteOne();
        res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (error) {
        log.error("Error in deleteQuestion:", error);
        next(error);
    }
};

// @desc    Get all questions with filters
// @route   GET /api/questions
// @access  Private/Admin
const getAllQuestions = async (req, res, next) => {
    const { topic, date, workerId, includeDefaultTopics } = req.query;
    try {
        let query = {};
        if (workerId && mongoose.Types.ObjectId.isValid(workerId)) {
            query.worker = new mongoose.Types.ObjectId(workerId);
        }
        if (topic) {
            query.topic = { $regex: topic, $options: 'i' };
        }
        if (includeDefaultTopics !== undefined) {
            query.isDefaultTopic = includeDefaultTopics === 'true';
        }
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            query.createdAt = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }
        const questions = await Question.find(query)
            .populate('worker', 'name workerId email')
            .sort({ createdAt: -1 })
            .lean();
        const stats = {
            totalQuestions: questions.length,
            uniqueWorkers: [...new Set(questions.map(q => q.worker?._id?.toString()))].length,
            defaultTopicQuestions: questions.filter(q => q.isDefaultTopic).length,
            specificTopicQuestions: questions.filter(q => !q.isDefaultTopic).length
        };
        res.status(200).json({
            questions,
            stats
        });
    } catch (error) {
        log.error("Error in getAllQuestions:", error);
        next(error);
    }
};

// @desc    Get question generation statistics
// @route   GET /api/questions/stats
// @access  Private/Admin
const getQuestionStats = async (req, res, next) => {
    const { startDate, endDate } = req.query;
    try {
        let dateQuery = {};
        if (startDate || endDate) {
            dateQuery.createdAt = {};
            if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
            if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
        }
        const stats = await Question.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: { worker: '$worker', isDefaultTopic: '$isDefaultTopic' },
                    count: { $sum: 1 },
                    topics: { $addToSet: '$topic' }
                }
            },
            {
                $group: {
                    _id: '$_id.worker',
                    totalQuestions: { $sum: '$count' },
                    defaultTopicQuestions: { $sum: { $cond: ['$_id.isDefaultTopic', '$count', 0] } },
                    specificTopicQuestions: { $sum: { $cond: ['$_id.isDefaultTopic', 0, '$count'] } },
                    uniqueTopics: { $push: '$topics' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'workerInfo'
                }
            },
            {
                $unwind: {
                    path: '$workerInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    workerName: '$workerInfo.name',
                    workerId: '$workerInfo.workerId',
                    totalQuestions: 1,
                    defaultTopicQuestions: 1,
                    specificTopicQuestions: 1,
                    uniqueTopics: { $reduce: { input: '$uniqueTopics', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } }
                }
            },
            { $sort: { totalQuestions: -1 } }
        ]);
        const summary = {
            totalWorkers: stats.length,
            totalQuestions: stats.reduce((sum, s) => sum + s.totalQuestions, 0),
            workersWithDefaultTopics: stats.filter(s => s.defaultTopicQuestions > 0).length,
            workersWithSpecificTopics: stats.filter(s => s.specificTopicQuestions > 0).length,
            averageQuestionsPerWorker: stats.length > 0
                ? Math.round(stats.reduce((sum, s) => sum + s.totalQuestions, 0) / stats.length)
                : 0
        };
        res.status(200).json({ summary, workerStats: stats });
    } catch (error) {
        log.error("Error in getQuestionStats:", error);
        next(error);
    }
};

// @desc    Validate topics before generation
// @route   POST /api/questions/validate-topics
// @access  Private/Admin
const validateTopics = async (req, res, next) => {
    const { workerIds, topicMode, individualTopics } = req.body;
    try {
        if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
            return res.status(400).json({ valid: false, message: 'No workers selected.' });
        }
        const validationResults = [];
        const workersWithoutTopics = [];
        const workersWithTopics = [];
        for (const workerId of workerIds) {
            if (!mongoose.Types.ObjectId.isValid(workerId)) {
                validationResults.push({ workerId, valid: false, reason: 'Invalid worker ID' });
                continue;
            }
            const worker = await User.findById(workerId).select('name workerId email');
            if (!worker) {
                validationResults.push({ workerId, valid: false, reason: 'Worker not found' });
                continue;
            }
            let topics = [];
            if (topicMode === 'individual' && individualTopics) {
                topics = individualTopics[workerId] || [];
                if (topics.length === 0) {
                    const dbTopics = await LearningTopic.find({ worker: workerId }).select('topic').lean();
                    topics = dbTopics.map(t => t.topic);
                }
            }
            if (topics.length === 0) {
                workersWithoutTopics.push({ workerId, workerName: worker.name, workerEmployeeId: worker.workerId });
            } else {
                workersWithTopics.push({ workerId, workerName: worker.name, workerEmployeeId: worker.workerId, topicCount: topics.length });
            }
            validationResults.push({ workerId, workerName: worker.name, valid: true, hasTopics: topics.length > 0, topicCount: topics.length });
        }
        res.status(200).json({
            valid: true,
            totalWorkers: workerIds.length,
            workersWithTopics: workersWithTopics.length,
            workersWithoutTopics: workersWithoutTopics.length,
            details: { withTopics: workersWithTopics, withoutTopics: workersWithoutTopics },
            validationResults
        });
    } catch (error) {
        log.error("Error in validateTopics:", error);
        res.status(500).json({ valid: false, message: 'Error validating topics', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// @desc    Retry failed question generation
// @route   POST /api/questions/retry
// @access  Private/Admin
const retryFailedGeneration = async (req, res, next) => {
    const { failedWorkers, numQuestions, difficulty, timeDuration, totalTestDuration, fallbackToDefault } = req.body;
    if (!failedWorkers || !Array.isArray(failedWorkers) || failedWorkers.length === 0) {
        return res.status(400).json({ message: 'No failed workers to retry.' });
    }
    const session = await mongoose.startSession();
    session.startTransaction({ maxTimeMS: 120000, readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
    try {
        const retryResults = [];
        const stillFailedWorkers = [];
        let totalQuestionsGenerated = 0;
        for (const workerId of failedWorkers) {
            try {
                const worker = await User.findById(workerId).session(session);
                if (!worker) {
                    stillFailedWorkers.push({ id: workerId, reason: 'Worker not found' });
                    continue;
                }
                let topicsToUse = [];
                const dbTopics = await LearningTopic.find({ worker: workerId }).select('topic').lean().session(session);
                topicsToUse = dbTopics.map(t => t.topic);
                if (topicsToUse.length === 0 && fallbackToDefault) {
                    topicsToUse = DEFAULT_FALLBACK_TOPICS;
                }
                if (topicsToUse.length === 0) {
                    stillFailedWorkers.push({ id: workerId, name: worker.name, reason: 'No topics available' });
                    continue;
                }
                const targetQuestions = parseInt(numQuestions);
                const baseQuestionsPerTopic = Math.floor(targetQuestions / topicsToUse.length);
                const remainingQuestions = targetQuestions % topicsToUse.length;
                let generatedQuestions = [];
                for (let i = 0; i < topicsToUse.length; i++) {
                    const topic = topicsToUse[i];
                    const questionsForThisTopic = baseQuestionsPerTopic + (i < remainingQuestions ? 1 : 0);
                    try {
                        const questions = await generateWithRetry(topic, questionsForThisTopic, difficulty);
                        generatedQuestions.push(...questions.slice(0, questionsForThisTopic));
                    } catch (error) {
                        log.error(`Failed to generate questions for topic ${topic}:`, error);
                    }
                }
                if (generatedQuestions.length === 0) {
                    stillFailedWorkers.push({ id: workerId, name: worker.name, reason: 'AI generation failed' });
                    continue;
                }
                const questionsToSave = generatedQuestions.slice(0, targetQuestions).map(q => {
                    const correctOptionIndex = q.options.findIndex(opt => String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase());
                    return {
                        worker: workerId,
                        topic: topicsToUse.join(', '),
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: correctOptionIndex !== -1 ? correctOptionIndex : 0,
                        difficulty: q.difficulty || difficulty,
                        timeDuration: parseInt(timeDuration, 10),
                        totalTestDuration: parseInt(totalTestDuration, 10),
                        isDefaultTopic: fallbackToDefault && dbTopics.length === 0
                    };
                });
                const bulkOps = questionsToSave.map(q => ({ insertOne: { document: q } }));
                await Question.bulkWrite(bulkOps, { session });
                retryResults.push({
                    workerId,
                    workerName: worker.name,
                    questionsGenerated: questionsToSave.length,
                    usedDefaultTopics: fallbackToDefault && dbTopics.length === 0
                });
                totalQuestionsGenerated += questionsToSave.length;
            } catch (error) {
                log.error(`Error retrying generation for worker ${workerId}:`, error);
                stillFailedWorkers.push({ id: workerId, reason: 'Processing error' });
            }
        }
        await session.commitTransaction();
        res.status(201).json({
            message: `Retry completed. Generated ${totalQuestionsGenerated} questions for ${retryResults.length} worker(s).`,
            successfulRetries: retryResults,
            stillFailedWorkers,
            totalQuestionsGenerated
        });
    } catch (error) {
        await session.abortTransaction();
        log.error("Error in retryFailedGeneration:", error);
        res.status(500).json({ message: 'Error during retry operation', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    } finally {
        session.endSession();
    }
};

module.exports = {
    generateAndStoreQuestions,
    getQuestionsForTest,
    getAllQuestions,
    updateQuestion,
    deleteQuestion,
    updateTestAttemptProgress,
    getQuestionStats,
    validateTopics,
    retryFailedGeneration
};