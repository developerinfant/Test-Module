// frontend/src/components/worker/DailyTopicForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import InputField from '../common/InputField';
import Button from '../common/Button';

const DailyTopicForm = ({ onTopicSubmitted }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/topics', { workerId: user._id, topic });
      setMessage('Your topic for today has been submitted. Thank you!');
      setTopic('');
      if (onTopicSubmitted) {
        onTopicSubmitted();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit topic.');
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md text-center">
        <p className="font-bold">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Learning Log</h3>
      <p className="text-gray-600 mb-4">What was the main topic you studied or worked on today?</p>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Enter Topic (e.g., React Hooks)"
          type="text"
          id="dailyTopic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Topic for Today'}
        </Button>
      </form>
    </div>
  );
};

export default DailyTopicForm;