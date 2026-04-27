// backend/constants/defaults.js
module.exports = {
    DEFAULT_FALLBACK_TOPICS: [
        'General Knowledge',
        'Problem Solving',
        'Communication Skills'
    ],
    BATCH_SIZE: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    MAX_WORKERS_PER_REQUEST: 100,
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 100,
    SESSION_TIMEOUT_MS: 120000, // 2 minutes
    PROGRESS_UPDATE_INTERVAL: 2000
};