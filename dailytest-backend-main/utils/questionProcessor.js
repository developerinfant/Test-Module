// backend/utils/questionProcessor.js
const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');
const LearningTopic = require('../models/LearningTopic');
const { generateMCQQuestions } = require('./openai');
const jobManager = require('./jobManager');

const log = {
    info: (message, data = {}) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data),
    error: (message, error = {}) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error),
    warn: (message, data = {}) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data)
};

async function runWithConcurrency(tasks, concurrency) {
    const results = [];
    let currentIndex = 0;

    async function worker() {
        while (currentIndex < tasks.length) {
            const taskIndex = currentIndex++;
            if (tasks[taskIndex]) {
                results[taskIndex] = await tasks[taskIndex]();
            }
        }
    }

    const workers = Array(concurrency).fill(null).map(worker);
    await Promise.all(workers);
    return results;
}

const processQuestionGeneration = async (jobData, jobId) => {
    const {
        workerIds,
        numQuestions,
        difficulty,
        timeDuration,
        totalTestDuration,
        topicMode,
        topic: commonTopic,
        individualTopics
    } = jobData;

    log.info('Starting robust, concurrent question generation job:', { numWorkers: workerIds.length, jobId });

    const workers = await User.find({ _id: { $in: workerIds } });
    const workerMap = new Map(workers.map(w => [w._id.toString(), w]));
    let workersProcessed = 0;

    // For common mode, generate questions once and reuse them for all workers
    let commonQuestions = [];
    if (topicMode === 'common' && commonTopic) {
        const topicsToUse = commonTopic.split(',').map(t => t.trim()).filter(Boolean);
        if (topicsToUse.length > 0) {
            const combinedTopicString = topicsToUse.join(', ');
            const targetQuestions = parseInt(numQuestions);
            const totalTopics = topicsToUse.length;
            const baseQuestionsPerTopic = Math.floor(targetQuestions / totalTopics);
            const remainingQuestions = targetQuestions % totalTopics;
            
            for (let i = 0; i < totalTopics; i++) {
                const currentTopic = topicsToUse[i];
                const questionsForThisTopic = baseQuestionsPerTopic + (i < remainingQuestions ? 1 : 0);
                
                if (questionsForThisTopic > 0) {
                    try {
                        const result = await generateMCQQuestions([currentTopic], questionsForThisTopic, difficulty);
                        const generatedQuestions = result[currentTopic] || [];
                        commonQuestions.push(...generatedQuestions.slice(0, questionsForThisTopic));
                    } catch (error) {
                        log.error(`Failed to generate questions for topic "${currentTopic}":`, error.message);
                    }
                }
            }

            commonQuestions = commonQuestions.slice(0, targetQuestions);
            log.info(`Generated ${commonQuestions.length} common questions for ${workerIds.length} workers`);
        }
    }

    const tasks = workerIds.map(workerId => async () => {
        const session = await mongoose.startSession();
        let taskResult;

        try {
            await session.withTransaction(async () => {
                const worker = workerMap.get(workerId);
                if (!worker) {
                    throw new Error('Worker not found in map');
                }

                let topicsToUse = [];
                let rawTopics = [];
                let allQuestionsForWorker = [];

                if (topicMode === 'common' && commonTopic) {
                    // Use the pre-generated common questions for this worker
                    topicsToUse = commonTopic.split(',').map(t => t.trim()).filter(Boolean);
                    const combinedTopicString = topicsToUse.join(', ');
                    
                    // Shuffle the common questions for this worker
                    allQuestionsForWorker = [...commonQuestions].sort(() => Math.random() - 0.5);
                } else {
                    rawTopics = (individualTopics && individualTopics[workerId]) || [];
                    
                    if (rawTopics.length === 0) {
                        const dbTopics = await LearningTopic.find({ worker: workerId }).select('topic').lean().session(session);
                        rawTopics = dbTopics.map(t => t.topic);
                    }
                    
                    for (const rawTopic of rawTopics) {
                        if (typeof rawTopic === 'string' && rawTopic.includes(',')) {
                            const splitTopics = rawTopic.split(',').map(t => t.trim()).filter(Boolean);
                            topicsToUse.push(...splitTopics);
                        } else if (rawTopic && typeof rawTopic === 'string') {
                            topicsToUse.push(rawTopic.trim());
                        }
                    }
                    
                    topicsToUse = [...new Set(topicsToUse)].filter(Boolean);

                    if (topicsToUse.length === 0) {
                        log.warn(`Skipping ${worker.name}: No topics found.`);
                        taskResult = { workerId, workerName: worker.name, success: false, reason: 'No topics' };
                        return;
                    }

                    const combinedTopicString = topicsToUse.join(', ');
                    const targetQuestions = parseInt(numQuestions);
                    const totalTopics = topicsToUse.length;
                    const baseQuestionsPerTopic = Math.floor(targetQuestions / totalTopics);
                    const remainingQuestions = targetQuestions % totalTopics;
                    
                    for (let i = 0; i < totalTopics; i++) {
                        const currentTopic = topicsToUse[i];
                        const questionsForThisTopic = baseQuestionsPerTopic + (i < remainingQuestions ? 1 : 0);
                        
                        if (questionsForThisTopic > 0) {
                            try {
                                const result = await generateMCQQuestions([currentTopic], questionsForThisTopic, difficulty);
                                const generatedQuestions = result[currentTopic] || [];
                                allQuestionsForWorker.push(...generatedQuestions.slice(0, questionsForThisTopic));
                            } catch (error) {
                                log.error(`Failed to generate questions for topic "${currentTopic}":`, error.message);
                            }
                        }
                    }

                    allQuestionsForWorker = allQuestionsForWorker.slice(0, targetQuestions);
                }

                if (allQuestionsForWorker.length === 0) {
                    taskResult = { workerId, workerName: worker.name, success: false, reason: 'AI failed to generate questions' };
                    return;
                }

                const questionsToSave = allQuestionsForWorker.map(q => {
                    const correctOptionIndex = q.options.findIndex(
                        (opt) => String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
                    );
                    return {
                        worker: worker._id,
                        topic: topicsToUse.join(', '),
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: correctOptionIndex !== -1 ? correctOptionIndex : 0,
                        difficulty: q.difficulty || difficulty,
                        timeDuration: parseInt(timeDuration),
                        totalTestDuration: parseInt(totalTestDuration)
                    };
                }).filter(Boolean);

                if (questionsToSave.length > 0) {
                    await Question.insertMany(questionsToSave, { session });
                    // Mark employee as having generated questions
                    await User.findByIdAndUpdate(worker._id, { hasGeneratedQuestions: true }, { session });
                }

                taskResult = { 
                    workerId, 
                    workerName: worker.name, 
                    success: true, 
                    questionsGenerated: questionsToSave.length,
                    targetQuestions: parseInt(numQuestions),
                    topics: topicsToUse.join(', ')
                };
            });
        } catch (error) {
            const workerName = workerMap.get(workerId)?.name || 'Unknown';
            log.error(`Transaction failed for worker ${workerName}:`, error.message);
            taskResult = { workerId, workerName, success: false, reason: error.message };
        } finally {
            await session.endSession();
        }
        
        workersProcessed++;
        jobManager.updateJobProgress(jobId, Math.round((workersProcessed / workerIds.length) * 100));
        return taskResult;
    });

    const results = await runWithConcurrency(tasks, 5); // Concurrently process 5 workers at a time

    const successfulWorkers = results.filter(r => r && r.success);
    const failedWorkers = results.filter(r => r && !r.success);
    const totalQuestionsGenerated = successfulWorkers.reduce((sum, r) => sum + r.questionsGenerated, 0);

    const returnValue = {
        success: true,
        results: successfulWorkers,
        failedWorkers,
        totalQuestionsGenerated
    };

    jobManager.completeJob(jobId, returnValue);
    return returnValue;
};

module.exports = { processQuestionGeneration };