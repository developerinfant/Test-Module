
// frontend/src/pages/worker/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../../components/common/Button';
import DailyTopicForm from '../../components/worker/DailyTopicForm';
import Loader from '../../components/common/Loader'; // Ensure Loader is imported

function WorkerDashboard() {
    // State for the component
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [testAlreadyTaken, setTestAlreadyTaken] = useState(false);
    const [noTestsAvailable, setNoTestsAvailable] = useState(false);
    const [waitingForQuestions, setWaitingForQuestions] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [topicSubmittedToday, setTopicSubmittedToday] = useState(false);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    // Effect hook to fetch all necessary data for the dashboard
   useEffect(() => {
    const fetchData = async () => {
        if (!user || user.role !== 'worker') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        setWaitingForQuestions(false);

        const [testStatusRes, topicStatusRes] = await Promise.allSettled([
            api.get(`/questions/${user._id}`),
            api.post('/topics/check', { workerId: user._id })
        ]);

        // Handle Test Status
        if (testStatusRes.status === 'fulfilled') {
            setNoTestsAvailable(false);
            setTestAlreadyTaken(false);
            setCurrentTopic(testStatusRes.value.data.latestTopic);
        } else {
            const status = testStatusRes.reason.response?.status;
            if (status === 404) {
                // Check if this is because admin hasn't generated questions yet
                const errorMessage = testStatusRes.reason.response?.data?.message || '';
                if (errorMessage.includes('No questions found') || errorMessage.includes('not been generated')) {
                    setWaitingForQuestions(true);
                } else {
                    setNoTestsAvailable(true);
                }
            } else if (status === 403) {
                setTestAlreadyTaken(true);
            } else {
                setError('Failed to fetch test status.');
                console.error("Error fetching test status:", testStatusRes.reason);
            }
        }

        // Handle Topic Submission Status
        if (topicStatusRes.status === 'fulfilled' && topicStatusRes.value.data.submitted) {
            setTopicSubmittedToday(true);
        } else {
            setTopicSubmittedToday(false);
            // Optional: You could add a specific error handler for this call if needed
            if (topicStatusRes.status === 'rejected') {
                console.error("Error fetching topic status:", topicStatusRes.reason);
            }
        }

        setLoading(false);
    };

    fetchData();
}, [user]);

    const handleTakeTest = () => {
        if (user && user._id && currentTopic) {
            navigate(`/worker/${user._id}/test?topic=${encodeURIComponent(currentTopic)}`);
        } else {
            alert('Cannot start the test. Please contact an administrator.');
        }
    };
    
    // Render loading state
    if (loading) {
        return <Loader />;
    }

    // Render a fatal error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600 p-4">
                <p>{error}</p>
            </div>
        );
    }
    
    // Redirect if user is not a worker or not logged in
    if (!user || user.role !== 'worker') {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <div className="w-full max-w-2xl space-y-8">
                {/* Test Status Card */}
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h1>
                    <p className="text-gray-600 mb-6">ID: {user.workerId}</p>
                    
                    {testAlreadyTaken ? (
    <div className="bg-blue-50 text-blue-800 border border-blue-200 p-4 rounded-lg shadow-sm" role="alert">
        <p className="font-bold">Test Completed!</p>
        <p>You have already taken the test for today. Check back tomorrow!</p>
    </div>
) : waitingForQuestions ? (
    <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-4 rounded-lg shadow-sm" role="alert">
        <p className="font-bold">Please Wait</p>
        <p>Your test has not been generated yet. The admin needs to assign questions for you. Please check back later.</p>
    </div>
) : noTestsAvailable ? (
    <div className="bg-orange-50 text-orange-800 border border-orange-200 p-4 rounded-lg shadow-sm" role="alert">
        <p className="font-bold">No Test Available</p>
        <p>A test has not been generated for you yet. Please log your topic below and contact your administrator.</p>
    </div>
) : (
    <Button onClick={handleTakeTest} className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 text-lg">
        Start Your Daily Test
    </Button>
)}
                </div>

                {/* Daily Topic Submission Card */}
                {topicSubmittedToday ? (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md text-center">
                        <p className="font-bold">You have already logged your topic for today. Great job!</p>
                    </div>
                ) : (
                    <DailyTopicForm onTopicSubmitted={() => setTopicSubmittedToday(true)} />
                )}
            </div>
        </div>
    );
}

export default WorkerDashboard;