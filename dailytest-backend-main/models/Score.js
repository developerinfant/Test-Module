// backend/models/Score.js
const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Each worker has one cumulative score entry
    // Remove the department field
    totalScore: { type: Number, default: 0 },
});

module.exports = mongoose.model('Score', scoreSchema);