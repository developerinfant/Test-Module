const express = require('express');
const { getAdminProfile } = require('../controllers/adminController');
// Removed: const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', getAdminProfile); // Removed protect, authorizeRoles

module.exports = router;