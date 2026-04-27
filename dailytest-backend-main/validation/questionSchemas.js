// backend/validation/questionSchemas.js
const Joi = require('joi');

const generateQuestionsSchema = Joi.object({
    workerIds: Joi.array().items(Joi.string().hex().length(24)).min(1).max(100).required(),
    numQuestions: Joi.number().integer().min(1).max(100).required(),
    timeDuration: Joi.number().integer().min(10).max(300).required(),
    totalTestDuration: Joi.number().integer().min(60).max(7200).required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
    topicMode: Joi.string().valid('common', 'individual').required(),
    topic: Joi.string().when('topicMode', {
        is: 'common',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    individualTopics: Joi.object().pattern(
        Joi.string().hex().length(24),
        Joi.array().items(Joi.string())
    ).when('topicMode', {
        is: 'individual',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    fallbackStrategy: Joi.string().valid('default', 'skip').required(),
    defaultTopics: Joi.array().items(Joi.string()).optional()
});

module.exports = {
    generateQuestionsSchema
};