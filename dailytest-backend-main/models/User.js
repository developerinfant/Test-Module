// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // Admin might have email, worker might not always
    password: { type: String, required: true },
    plainPassword: { type: String }, // Store unencrypted password (⚠ security risk)
    role: { type: String, enum: ['admin', 'worker'], default: 'worker' },
    // Remove the entire department field block
    workerId: { type: String, unique: true, sparse: true }, // For workers to login via profile click
    registerNumber: { type: String, required: false, unique: true, sparse: true }, // Employee register number for self-registration with unique constraint
    registrationType: { type: String, enum: ['admin', 'self'], default: 'admin' }, // Track who created the account
    hasGeneratedQuestions: { type: Boolean, default: false } // Track if admin has generated questions for this employee
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);