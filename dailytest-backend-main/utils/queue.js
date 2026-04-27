const Queue = require('bull');
const { processQuestionGeneration } = require('./questionProcessor');

const questionGenerationQueue = new Queue('question generation', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || '127.0.0.1',
    },
});

// Increase concurrency to process up to 5 jobs at the same time
questionGenerationQueue.process('generate-questions-job', 5, async (job, done) => {
    const { data } = job;
    
    try {
        console.log('Starting question generation job:', job.id);
        
        const result = await processQuestionGeneration(data, (progress) => {
            job.progress(progress);
        });
        
        console.log('Question generation job completed:', job.id);
        done(null, result);
        
    } catch (error) {
        console.error('Question generation job failed:', job.id, error);
        done(error);
    }
});

// Add event listeners for better logging
questionGenerationQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed successfully with result:`, result);
});

questionGenerationQueue.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with error:`, err.message);
});

questionGenerationQueue.on('progress', (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
});

module.exports = {
    questionGenerationQueue
};