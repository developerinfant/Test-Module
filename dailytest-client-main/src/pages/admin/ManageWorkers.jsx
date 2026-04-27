// frontend/src/pages/admin/ManageWorkers.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import WorkerFormModal from '../../components/admin/WorkerFormModal';

function ManageWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentWorker, setCurrentWorker] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState({});

    const fetchWorkers = async () => {
        setLoading(true);
        setFetchError('');
        try {
            const workersRes = await api.get('/workers');
            setWorkers(workersRes.data);
            setFetchError('');
        } catch (err) {
            setFetchError(err.response?.data?.message || 'Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const handleAddWorkerClick = () => {
        setIsEditing(false);
        setCurrentWorker(null);
        setIsModalOpen(true);
        setError('');
        setMessage('');
    };

    const handleEditClick = (worker) => {
        setIsEditing(true);
        setCurrentWorker(worker);
        setIsModalOpen(true);
        setError('');
        setMessage('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentWorker(null);
        setError('');
        setMessage('');
    };

    const handleModalSubmit = async (formData) => {
        setActionLoading(true);
        setError('');
        setMessage('');

        try {
            let res;
            if (isEditing) {
                res = await api.put(`/workers/${currentWorker._id}`, formData);
            } else {
                res = await api.post('/workers', formData);
            }
            setMessage(res.data.message);
            handleCloseModal();
            fetchWorkers();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} worker.`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteWorker = async (workerId, workerName) => {
        if (window.confirm(`Are you sure you want to delete worker "${workerName}"? This action cannot be undone and will delete all associated scores and test attempts.`)) {
            try {
                setActionLoading(true);
                const res = await api.delete(`/workers/${workerId}`);
                setMessage(res.data.message);
                fetchWorkers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete worker.');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const togglePasswordVisibility = (workerId) => {
        setShowPassword(prev => ({
            ...prev,
            [workerId]: !prev[workerId]
        }));
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker.workerId && worker.workerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-2">
                                Manage employees
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Efficiently manage your workforce with comprehensive employee controls
                            </p>
                        </div>
                        <div className="flex items-center justify-center lg:justify-end">
                            <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl shadow-sm border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Total Employees</p>
                                        <p className="text-lg sm:text-xl font-semibold text-gray-800">{workers.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-green-200 p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <InputField
                                    label="Search employees"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleAddWorkerClick}
                            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            disabled={isModalOpen || actionLoading}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New employee
                        </Button>
                    </div>
                </div>

                {/* Alert Messages */}
                {fetchError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 text-sm">{fetchError}</p>
                        </div>
                    </div>
                )}

                {message && !isModalOpen && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-600 text-sm">{message}</p>
                        </div>
                    </div>
                )}

                {error && !isModalOpen && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-green-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="text-lg sm:text-xl font-medium text-gray-800">Existing employees</h3>
                            <p className="text-sm text-gray-600">
                                Showing {filteredWorkers.length} of {workers.length} employees
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                            <p className="text-gray-600">Loading workers...</p>
                        </div>
                    ) : filteredWorkers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No employees found</h3>
                            <p className="text-gray-600 text-center max-w-sm">
                                {searchTerm ? 'No workers found matching your search criteria.' : 'Get started by adding your first employee to the system.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Password
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredWorkers.map((worker, index) => (
                                            <tr key={worker._id} className="hover:bg-green-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                                                            {worker.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {worker.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Employee #{index + 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            {worker.workerId}
                                                        </span>
                                                        <button
                                                            onClick={() => copyToClipboard(worker.workerId)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
                                                            title="Copy ID"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-md border">
                                                            {showPassword[worker._id] ? worker.plainPassword : '••••••••'}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(worker._id)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
                                                            title={showPassword[worker._id] ? "Hide password" : "Show password"}
                                                        >
                                                            {showPassword[worker._id] ? (
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(worker.plainPassword)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
                                                            title="Copy password"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            onClick={() => handleEditClick(worker)} 
                                                            className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md hover:bg-green-50 transition-all duration-150"
                                                        >
                                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleDeleteWorker(worker._id, worker.name)} 
                                                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-all duration-150"
                                                        >
                                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden">
                                <div className="divide-y divide-gray-200">
                                    {filteredWorkers.map((worker, index) => (
                                        <div key={worker._id} className="p-6 hover:bg-green-50 transition-colors duration-150">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-lg">
                                                        {worker.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-base font-medium text-gray-900">
                                                            {worker.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Employee #{index + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                        Employee ID
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                                            {worker.workerId}
                                                        </span>
                                                        <button
                                                            onClick={() => copyToClipboard(worker.workerId)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
                                                            title="Copy ID"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                        Password
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-md border min-w-0 flex-1">
                                                            {showPassword[worker._id] ? worker.plainPassword : '••••••••'}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(worker._id)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                                                            title={showPassword[worker._id] ? "Hide password" : "Show password"}
                                                        >
                                                            {showPassword[worker._id] ? (
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(worker.plainPassword)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                                                            title="Copy password"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                                                <Button
                                                    onClick={() => handleEditClick(worker)}
                                                    className="flex-1 text-green-600 hover:text-green-900 px-4 py-2 rounded-md hover:bg-green-50 transition-all duration-150 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteWorker(worker._id, worker.name)}
                                                    className="flex-1 text-red-600 hover:text-red-900 px-4 py-2 rounded-md hover:bg-red-50 transition-all duration-150 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <WorkerFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                isEditing={isEditing}
                initialData={currentWorker}
                actionLoading={actionLoading}
                error={error}
                message={message}
            />

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default ManageWorkers;