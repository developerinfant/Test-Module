import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, IdCard, CheckCircle, AlertCircle, Loader2, Key } from 'lucide-react';
import api from '../../services/api';
import Button from '../common/Button';

const EmployeeSelfRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        registerNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name.trim() || !formData.registerNumber.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/employee/register', {
                name: formData.name.trim(),
                registerNumber: formData.registerNumber.trim()
            });

            if (response.data.success) {
                setSuccess(response.data.employee);
                setShowPassword(true);
                // Call success callback after a short delay to show success message
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(response.data.employee);
                    }
                }, 3000);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: '', registerNumber: '' });
        setError('');
        setSuccess(null);
        setShowPassword(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <User className="mr-3" size={24} />
                                <h2 className="text-xl font-bold">Employee Registration</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-green-100 text-sm mt-2">
                            Register to start your daily test journey
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="inline mr-2" size={16} />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Register Number Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <IdCard className="inline mr-2" size={16} />
                                        Register Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="registerNumber"
                                        value={formData.registerNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter your register number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center"
                                    >
                                        <AlertCircle className="mr-2 flex-shrink-0" size={16} />
                                        <span className="text-sm">{error}</span>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading || !formData.name.trim() || !formData.registerNumber.trim()}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={18} />
                                            Registering...
                                        </>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </Button>
                            </form>
                        ) : (
                            // Success State
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle className="text-green-600" size={32} />
                                </motion.div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Registration Successful!
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Your account has been created successfully.
                                    </p>
                                </div>

                                {/* Registration Details */}
                                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{success.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Register Number:</span>
                                        <span className="font-medium">{success.registerNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Employee ID:</span>
                                        <span className="font-medium text-green-600">{success.workerId}</span>
                                    </div>
                                    {showPassword && (
                                        <div className="border-t pt-2 mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">
                                                    <Key className="inline mr-1" size={14} />
                                                    Password:
                                                </span>
                                                <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                    {success.registerNumber}
                                                </span>
                                            </div>
                                            <p className="text-xs text-green-700 mt-1">
                                                💡 Your password is your Register Number - easy to remember!
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Info Message */}
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                    <p className="font-medium mb-1">Next Steps:</p>
                                    <ul className="text-xs space-y-1">
                                        <li>• Use your Register Number as password to login</li>
                                        <li>• Admin must generate test questions for you</li>
                                        <li>• You'll be notified when your test is ready</li>
                                        <li>• You can change your password after first login</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleClose}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700"
                                >
                                    Got It!
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmployeeSelfRegistrationModal;