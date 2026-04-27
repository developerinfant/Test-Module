// backend/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    // Remove the `department` field
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    topic: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    timeDuration: { type: Number, default: 15 },
    totalTestDuration: { type: Number, default: 600 },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);