// frontend/src/components/admin/WorkerFormModal.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';

// The `departments` prop is removed from the function signature.
function WorkerFormModal({
    isOpen,
    onClose,
    onSubmit,
    isEditing,
    initialData,
    actionLoading,
    error,
    message,
}) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    // The `departmentId` state is removed.
    const [editPassword, setEditPassword] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            // The `setDepartmentId` line is removed.
            setPassword('');
            setEditPassword('');
        } else if (isOpen && !isEditing) {
            setName('');
            setPassword('');
            // The `setDepartmentId` line is removed.
            setEditPassword('');
        }
    }, [isOpen, isEditing, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name,
            // The `departmentId` property is removed from the payload.
        };
        if (isEditing) {
            if (editPassword) {
                payload.password = editPassword;
            }
        } else {
            payload.password = password;
        }
        onSubmit(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-0 left-0 w-full flex justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mt-20 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    {isEditing ? 'Edit Employee' : 'Add New Worker'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Name"
                        type="text"
                        id="modalName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <InputField
                        label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                        type="password"
                        id="modalPassword"
                        value={isEditing ? editPassword : password}
                        onChange={(e) => isEditing ? setEditPassword(e.target.value) : setPassword(e.target.value)}
                        required={!isEditing}
                    />
                    {/* The entire Department div, including the label and select, is removed from the JSX */}
                    
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {message && <p className="text-green-600 text-sm mt-2">{message}</p>}

                    <div className="flex justify-center space-x-3 mt-6">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={actionLoading}
                            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {actionLoading ? 'Saving...' : (isEditing ? 'Update Worker' : 'Add Worker')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WorkerFormModal;