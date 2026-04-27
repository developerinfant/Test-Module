// backend/models/TestAttempt.js
const mongoose = require('mongoose');

const TestAttemptSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Remove the entire department field block
    topic: {
        type: String,
        required: true,
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
    ],
    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
            selectedOption: {
                type: String,
            },
            isCorrect: {
                type: Boolean,
            },
        },
    ],
    score: {
        type: Number,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        default: 0,
    },
    // New fields for session tracking
    currentQuestionIndex: {
        type: Number,
        default: 0,
    },
    questionStartTime: {
        type: Date,
        default: Date.now,
    },
    durationPerQuestion: {
        type: Number,
        required: true,
    },
    totalTestDuration: { // ADDED: New field for total test duration
        type: Number,
        required: true,
    },
    testStartTime: { // ADDED: New field for the start time of the entire test
        type: Date,
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'missed'],
        default: 'in-progress',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);