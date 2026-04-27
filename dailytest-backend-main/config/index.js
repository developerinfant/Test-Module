// backend/config/index.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    openaiApiKey: process.env.OPENAI_API_KEY,
    // Removed: openaiApiKey: process.env.OPENAI_API_KEY, // This line is no longer needed
};

// Removed: console.log("Loaded API Key from .env (from config/index.js):", config.openaiApiKey ? "Key Loaded (masked for security)" : "Key NOT Loaded");
// Removed: console.log("Full Key from .env (for debugging):", process.env.OPENAI_API_KEY);

module.exports = config;