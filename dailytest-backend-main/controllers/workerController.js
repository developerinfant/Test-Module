// backend/controllers/workerController.js
const User = require('../models/User');
const Score = require('../models/Score'); // Import Score model
const TestAttempt = require('../models/TestAttempt'); // Import TestAttempt model
const bcrypt = require('bcryptjs'); // For hashing new password
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// @desc    Create a new worker
// @route   POST /api/workers
// @access  Private/Admin
const createWorker = async (req, res) => {
    const { name, password } = req.body;

    try {
        const workerId = uuidv4().substring(0, 8);

        const user = await User.create({
            name,
            password,
            plainPassword: password, 
            role: 'worker',
            workerId,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            workerId: user.workerId,
            role: user.role,
            message: 'Worker created successfully!'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A worker with this ID might already exist (try again).' });
        }
        res.status(500).json({ message: 'Server error creating worker.' });
    }
};

// @desc    Get all workers
// @route   GET /api/workers
// @access  Private/Admin, Private/Worker (for searchable list)
const getWorkers = async (req, res) => {
    try {
        let query = { role: 'worker' };
        const workers = await User.find(query).select('name workerId plainPassword registrationType registerNumber');
        res.json(workers);
    } catch (error) {
        console.error("Server error fetching workers:", error);
        res.status(500).json({ message: 'Server error fetching workers.' });
    }
};

// @desc    Get a single worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
    try {
        const worker = await User.findById(req.params.id).select('name workerId role registrationType registerNumber');
        if (worker && worker.role === 'worker') {
            res.json(worker);
        } else {
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching worker.' });
    }
};

// @desc    Update a worker
// @route   PUT /api/workers/:id
// @access  Private/Admin
const updateWorker = async (req, res) => {
    const { name, password } = req.body;

    try {
        const worker = await User.findById(req.params.id);

        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found.' });
        }
        worker.name = name || worker.name;

        if (password) {
    worker.password = password; 
    worker.plainPassword = password; 
}

        const updatedWorker = await worker.save();

        res.json({
            _id: updatedWorker._id,
            name: updatedWorker.name,
            workerId: updatedWorker.workerId,
            role: updatedWorker.role,
            message: 'Worker updated successfully!'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating worker.' });
    }
};

// @desc    Delete a worker
// @route   DELETE /api/workers/:id
// @access  Private/Admin
const deleteWorker = async (req, res) => {
    try {
        const worker = await User.findById(req.params.id);

        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        await Score.deleteMany({ worker: worker._id });
        await TestAttempt.deleteMany({ worker: worker._id });

        await worker.deleteOne();

        res.json({ message: 'Worker removed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting worker.' });
    }
};

module.exports = {
    createWorker,
    getWorkers,
    getWorkerById,
    updateWorker,
    deleteWorker,
};