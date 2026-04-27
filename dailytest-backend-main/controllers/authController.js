// backend/controllers/authController.js
const User = require('../models/User');
// Note: generateToken is only used for hardcoded admin if you chose that path.
// For worker login, the token is not used in the current token-less setup.
// If you completely removed backend/utils/generateToken.js, you can remove the import below.
// If you kept it only for the hardcoded admin, then keep it.
const generateToken = require('../utils/generateToken'); // Keep if generateToken.js exists

// REMOVED: const Department = require('../models/Department'); // Needed for worker registration

// Define your hardcoded admin credentials here (HIGHLY INSECURE FOR PRODUCTION)
const HARDCODED_ADMIN_EMAIL = "techvaseegrah@gmail.com"; // Choose your desired hardcoded email
const HARDCODED_ADMIN_PASSWORD = "tech123"; // Choose your desired hardcoded password


// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Direct comparison against hardcoded credentials (for demonstration only)
    if (email === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASSWORD) {
        const hardcodedAdminId = "hardcodedAdminUser123";
        const hardcodedAdminName = "Hardcoded Admin";
        const hardcodedAdminRole = "admin";

        res.json({
            _id: hardcodedAdminId,
            name: hardcodedAdminName,
            email: HARDCODED_ADMIN_EMAIL,
            role: hardcodedAdminRole,
            // token: generateToken(hardcodedAdminId, hardcodedAdminRole), // REMOVED FOR TOKEN-LESS ADMIN
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Worker Login (by clicking profile and entering password)
// @route   POST /api/auth/worker/login
// @access  Public
const workerLogin = async (req, res) => {
    const { workerId, password } = req.body;

    try {
        // MODIFIED: Remove populate for department as it's no longer a part of the schema
        const user = await User.findOne({ workerId });

        if (user && user.role === 'worker' && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                workerId: user.workerId,
                // REMOVED: department: user.department,
                role: user.role,
                // token: generateToken(user._id, user.role), // REMOVED FOR TOKEN-LESS WORKER
            });
        } else {
            res.status(401).json({ message: 'Invalid worker ID or password' });
        }
    } catch (error) {
        console.error("Worker login error:", error);
        res.status(500).json({ message: 'Server error during worker login.' });
    }
};

// @desc    Get authenticated user profile (frontend will get user from localStorage instead in token-less setup)
// @route   NOT USED FOR TOKEN-LESS AUTH
const getMe = (req, res) => {
    // In the token-less setup, this endpoint is not used by the modified useAuth hook.
    // It's left here to avoid route errors if something else calls it, but its functionality is simplified.
    res.status(405).json({ message: 'Method Not Allowed: This endpoint is not actively used in token-less authentication.' });
};

// @desc    Employee Self-Registration
// @route   POST /api/auth/employee/register
// @access  Public
const employeeSelfRegister = async (req, res) => {
    console.log('=== REGISTRATION ENDPOINT HIT ===');
    const { name, registerNumber } = req.body;
    console.log('Registration attempt:', { name, registerNumber });

    try {
        // Validation
        if (!name || !registerNumber) {
            console.log('Validation failed: missing fields');
            return res.status(400).json({ message: 'Name and Register Number are required.' });
        }

        // Check for multiple possible conflicts
        const trimmedName = name.trim();
        const trimmedRegisterNumber = registerNumber.trim();
        
        // Check if register number already exists
        const existingByRegisterNumber = await User.findOne({ registerNumber: trimmedRegisterNumber });
        console.log('Existing employee by register number:', existingByRegisterNumber);
        if (existingByRegisterNumber) {
            console.log('Duplicate register number found');
            return res.status(400).json({ message: 'An employee with this register number already exists.' });
        }
        
        // Check if name already exists (case-insensitive)
        const existingByName = await User.findOne({ 
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });
        console.log('Existing employee by name:', existingByName);
        if (existingByName) {
            console.log('Duplicate name found');
            return res.status(400).json({ message: 'An employee with this name already exists. Please use a different name.' });
        }

        // Generate unique workerId with retry logic
        const { v4: uuidv4 } = require('uuid');
        let workerId;
        let attempts = 0;
        const maxAttempts = 5;
        
        do {
            workerId = uuidv4().substring(0, 8);
            const existingWorker = await User.findOne({ workerId });
            if (!existingWorker) break;
            attempts++;
        } while (attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            console.log('Failed to generate unique workerId after max attempts');
            return res.status(500).json({ message: 'Unable to generate unique employee ID. Please try again.' });
        }
        
        console.log('Generated workerId:', workerId);
        const defaultPassword = trimmedRegisterNumber; // Use registration ID as password
        console.log('Using password:', defaultPassword);

        // Create new employee record
        console.log('Creating employee with data:', {
            name: trimmedName,
            registerNumber: trimmedRegisterNumber,
            workerId,
            registrationType: 'self'
        });
        const employee = await User.create({
            name: trimmedName,
            registerNumber: trimmedRegisterNumber,
            password: defaultPassword,
            plainPassword: defaultPassword,
            role: 'worker',
            workerId,
            registrationType: 'self',
            hasGeneratedQuestions: false
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your details have been saved.',
            employee: {
                _id: employee._id,
                name: employee.name,
                registerNumber: employee.registerNumber,
                workerId: employee.workerId,
                defaultPassword: defaultPassword // Return password for employee to know
            }
        });
    } catch (error) {
        console.error('Employee self-registration error:', error);
        if (error.code === 11000) {
            // Log the specific duplicate key error
            console.error('Duplicate key error details:', error.keyPattern, error.keyValue);
            return res.status(400).json({ message: 'Registration details conflict with existing records.' });
        }
        res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
};

module.exports = {
    adminLogin,
    workerLogin,
    getMe,
    employeeSelfRegister,
};