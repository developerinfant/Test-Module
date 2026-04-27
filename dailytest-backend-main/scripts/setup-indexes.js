const mongoose = require('mongoose');
require('dotenv').config();

const setupIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Questions collection indexes
        const questionsDb = mongoose.connection.db.collection('questions');
        await questionsDb.createIndex({ worker: 1, topic: 1, createdAt: -1 });
        await questionsDb.createIndex({ isDefaultTopic: 1 });
        console.log('✓ Questions indexes created');

        // Users collection indexes  
        const usersDb = mongoose.connection.db.collection('users');
        await usersDb.createIndex({ role: 1, _id: 1 });
        console.log('✓ Users indexes created');

        console.log('All indexes created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating indexes:', error);
        process.exit(1);
    }
};

setupIndexes();
