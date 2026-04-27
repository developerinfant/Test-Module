// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, config.jwtSecret, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

module.exports = generateToken;