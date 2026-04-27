// backend/controllers/adminController.js
// This controller can be expanded for more admin-specific actions.

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
    // req.user is populated by the protect middleware
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
};

module.exports = {
    getAdminProfile,
};