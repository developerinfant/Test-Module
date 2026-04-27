// backend/routes/authRoutes.js
const express = require('express');
const { adminLogin, workerLogin, getMe, employeeSelfRegister } = require('../controllers/authController');
// No protect or authorizeRoles imported/used here
const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/worker/login', workerLogin);
router.post('/employee/register', employeeSelfRegister);
router.get('/me', getMe); // Removed 'protect' middleware here

module.exports = router;