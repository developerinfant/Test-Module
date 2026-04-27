// frontend/src/components/worker/WorkerLoginModal.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect import
import InputField from '../common/InputField';
import Button from '../common/Button';

function WorkerLoginModal({ isOpen, onClose, worker, onSubmit, loading, error }) {
    const [password, setPassword] = useState('');

    // Reset password field when modal opens/changes worker
    useEffect(() => { // Changed to useEffect
        if (isOpen) {
            setPassword('');
        }
    }, [isOpen, worker]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (worker && password) {
            onSubmit(worker, password);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Enter Password</h2>
                
                {worker && (
                    <p className="text-lg font-medium text-center mb-4">
                        For: {worker.name} ({worker.workerId})
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Password"
                        type="password" // This type will be overridden by isPassword prop in InputField
                        id="modalPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        isPassword // Enable password eye toggle
                    />
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                    <div className="flex justify-center mt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Enter Test'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WorkerLoginModal;