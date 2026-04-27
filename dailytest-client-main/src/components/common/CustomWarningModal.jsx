// frontend/src/components/common/CustomWarningModal.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';

function CustomWarningModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-500 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-cardpop">
        <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Warning!</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button
          onClick={onClose}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
        >
          OK, I Understand
        </Button>
      </div>
    </div>
  );
}

export default CustomWarningModal;