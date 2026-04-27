import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import DepartmentWorkerListModal from '../../components/admin/DepartmentWorkerListModal';

// Simple Toast component
function Toast({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`
        fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white text-sm transition-opacity duration-500
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}
      `}
      style={{ animation: 'fadein 0.5s, fadeout 0.5s 2.2s' }}
      onClick={onClose}
    >
      {message}
      <style>
        {`
          @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeout { from { opacity: 1; } to { opacity: 0; } }
        `}
      </style>
    </div>
  );
}

// Simple Modal component for editing
function EditDepartmentModal({ open, department, departmentName, onNameChange, onSubmit, onCancel, actionLoading, error }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-slideup relative">
        <h3 className="text-lg font-semibold mb-4">Edit Department</h3>
        <form onSubmit={onSubmit}>
          <InputField
            label="Department Name"
            type="text"
            id="editDepartmentName"
            value={departmentName}
            onChange={onNameChange}
           
            required
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex space-x-2 mt-4">
            <Button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : 'Update'}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              disabled={actionLoading}
              className="w-full bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </form>
        <style>
          {`
            .animate-slideup { animation: slideup 0.3s; }
            @keyframes slideup { from { transform: translateY(60px); opacity: 0; } to { transform: none; opacity: 1; } }
          `}
        </style>
      </div>
    </div>
  );
}

// Spinner
const Spinner = () => (
  <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
);

function ManageDepartments() {
  const [departmentName, setDepartmentName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // State for editing a department (modal)
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');

  // Toast state
  const [toast, setToast] = useState({ type: '', message: '' });

  // Worker List Modal states
  const [showWorkerListModal, setShowWorkerListModal] = useState(false);
  const [selectedDepartmentIdForWorkers, setSelectedDepartmentIdForWorkers] = useState(null);
  const [selectedDepartmentNameForWorkers, setSelectedDepartmentNameForWorkers] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments.');
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to fetch departments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Toast logic
  useEffect(() => {
    if (toast.message) {
      const timeout = setTimeout(() => setToast({ type: '', message: '' }), 2500);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  // ---- ADD Department ----
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');

    if (!departmentName) {
      setError('Department name is required.');
      setActionLoading(false);
      return;
    }

    try {
      const res = await api.post('/departments', { name: departmentName });
      setMessage(`Department "${res.data.name}" added successfully!`);
      setToast({ type: 'success', message: `Department "${res.data.name}" added!` });
      setDepartmentName('');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department.');
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add department.' });
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Edit Department Handlers ----
  const handleEditClick = (department) => {
    setCurrentDepartment(department);
    setEditDepartmentName(department.name);
    setIsEditing(true);
    setError('');
    setMessage('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');

    if (!editDepartmentName) {
      setError('Department name is required.');
      setActionLoading(false);
      return;
    }

    try {
      const res = await api.put(`/departments/${currentDepartment._id}`, { name: editDepartmentName });
      setMessage(res.data.message);
      setToast({ type: 'success', message: 'Department updated!' });
      setIsEditing(false);
      setCurrentDepartment(null);
      setEditDepartmentName('');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department.');
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update department.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setCurrentDepartment(null);
    setEditDepartmentName('');
    setError('');
    setMessage('');
  };

  // ---- Delete ----
  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (window.confirm(`Are you sure you want to delete department "${departmentName}"? This action cannot be undone if there are assigned workers or questions.`)) {
      try {
        setActionLoading(true);
        const res = await api.delete(`/departments/${departmentId}`);
        setMessage(res.data.message);
        setToast({ type: 'success', message: 'Department deleted!' });
        fetchDepartments();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete department.');
        setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete department.' });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // ---- Worker List Modal ----
  const handleViewWorkersClick = (departmentId, departmentName) => {
    setSelectedDepartmentIdForWorkers(departmentId);
    setSelectedDepartmentNameForWorkers(departmentName);
    setShowWorkerListModal(true);
  };
  const handleCloseWorkerListModal = () => {
    setShowWorkerListModal(false);
    setSelectedDepartmentIdForWorkers(null);
    setSelectedDepartmentNameForWorkers('');
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
      {/* Toast */}
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Departments</h2>

      {/* Add Department Form */}
      <form onSubmit={handleAddDepartment} className="mb-8 p-4 border rounded-lg bg-white shadow-lg">
        <h3 className="text-xl font-medium mb-4">Add New Department</h3>
        <InputField
          label="Department Name"
          type="text"
          id="departmentName"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          
          required
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="flex space-x-2 mt-4">
          <Button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-150"
          >
            {actionLoading ? <Spinner /> : 'Add Department'}
          </Button>
        </div>
      </form>

      {/* List Existing Departments as Cards */}
      <h3 className="text-xl font-medium mb-4">Existing Departments</h3>
      {loading ? (
        <div className="flex items-center space-x-2 text-blue-600 py-6">
          <Spinner />
          <span>Loading departments...</span>
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : departments.length === 0 ? (
        <p className="text-gray-600">No departments found. Add one above!</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-transform duration-150 border border-gray-100 group flex flex-col"
              style={{ minHeight: 180 }}
            >
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h4>
                <div className="mb-1 text-gray-600 text-sm">
                  Workers:{' '}
                  <button
                    onClick={() => handleViewWorkersClick(dept._id, dept.name)}
                    className={`underline font-medium ${
                      dept.workerCount > 0
                        ? 'text-blue-600 hover:text-blue-800'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={dept.workerCount === 0 || actionLoading}
                  >
                    {dept.workerCount}
                  </button>
                </div>
                <div className="mb-4 text-gray-600 text-sm">
                  Questions: <span className="font-medium">{dept.questionCount}</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={() => handleEditClick(dept)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded-md transition"
                  disabled={actionLoading}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-md transition"
                  disabled={actionLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Department Modal */}
      <EditDepartmentModal
        open={isEditing}
        department={currentDepartment}
        departmentName={editDepartmentName}
        onNameChange={(e) => setEditDepartmentName(e.target.value)}
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        actionLoading={actionLoading}
        error={error}
      />

      {/* Department Worker List Modal */}
      <DepartmentWorkerListModal
        isOpen={showWorkerListModal}
        onClose={handleCloseWorkerListModal}
        departmentId={selectedDepartmentIdForWorkers}
        departmentName={selectedDepartmentNameForWorkers}
      />
    </div>
  );
}

export default ManageDepartments;
