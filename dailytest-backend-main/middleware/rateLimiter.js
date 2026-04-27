const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { message },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

const generateLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    60, // limit each IP to 60 requests per windowMs
    'Too many generation requests'
);

const generalLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes  
    1000, // limit each IP to 1000 requests per windowMs
    'Too many requests'
);

module.exports = {
    generateLimiter,
    generalLimiter
};
