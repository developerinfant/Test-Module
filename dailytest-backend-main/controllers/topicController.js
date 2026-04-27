// backend/controllers/topicController.js
const LearningTopic = require('../models/LearningTopic');
const mongoose = require('mongoose');

// @desc    Submit a daily learning topic
// @route   POST /api/topics
// @access  Private/Worker
const submitTopic = async (req, res) => {
    const { workerId, topic } = req.body;
    if (!workerId || !topic) {
        return res.status(400).json({ message: 'Worker ID and topic are required.' });
    }
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const existingTopic = await LearningTopic.findOne({
            worker: workerId,
            createdAt: { $gte: today, $lt: tomorrow },
        });
        if (existingTopic) {
            return res.status(400).json({ message: 'You have already submitted a learning topic for today.' });
        }
        const newTopic = new LearningTopic({ worker: workerId, topic: topic });
        await newTopic.save();
        res.status(201).json({ message: 'Topic submitted successfully!' });
    } catch (error) {
        console.error("Error submitting topic:", error);
        res.status(500).json({ message: 'Server error while submitting topic.' });
    }
};

// @desc    Get unique topics for a specific worker within a date range
// @route   GET /api/topics/weekly/:workerId
// @access  Private/Admin
const getWeeklyTopicsForWorker = async (req, res) => {
    const { workerId } = req.params;
    const { startDate, endDate } = req.query; // Get optional dates from query parameters

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
        return res.status(400).json({ message: 'Invalid employee ID.' });
    }
    try {
        const matchQuery = {
            worker: new mongoose.Types.ObjectId(workerId),
        };

        // If both start and end dates are provided, create a date range filter
        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)), // Ensure the entire end day is included
            };
        } else {
            // Default to the last 7 days if no specific date range is given
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            matchQuery.createdAt = { $gte: sevenDaysAgo };
        }

        const topics = await LearningTopic.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$topic' } }, // Group by topic to get unique values
            { $project: { _id: 0, topic: '$_id' } } // Format the output
        ]);
        
        const topicList = topics.map(item => item.topic);
        res.status(200).json(topicList);
    } catch (error) {
        console.error("Error fetching weekly topics for worker:", error);
        res.status(500).json({ message: 'Server error while fetching weekly topics.' });
    }
};

// @desc    Check if a worker has submitted a topic for the current day
// @route   POST /api/topics/check
// @access  Private/Worker
const checkTopicForToday = async (req, res) => {
    const { workerId } = req.body;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const existingTopic = await LearningTopic.findOne({
            worker: workerId,
            createdAt: { $gte: today, $lt: tomorrow },
        });
        if (existingTopic) {
            return res.status(200).json({ submitted: true });
        } else {
            return res.status(404).json({ submitted: false });
        }
    } catch (error) {
        console.error("Error checking topic for today:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitTopic,
    getWeeklyTopicsForWorker,
    checkTopicForToday,
};