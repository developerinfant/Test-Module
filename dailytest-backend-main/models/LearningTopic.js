// backend/models/LearningTopic.js
const mongoose = require('mongoose');

const LearningTopicSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: String,
        required: true,
        trim: true,
    },
    isCommonTopic: {  // Add this field
        type: Boolean,
        default: false
    },
    assignedDate: {   // Add this field
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
LearningTopicSchema.index({ worker: 1, topic: 1 }, { unique: true });
module.exports = mongoose.model('LearningTopic', LearningTopicSchema);
