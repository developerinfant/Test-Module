// frontend/src/hooks/useTestSession.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Assuming api.js is in src/services

// MODIFIED: The hook no longer accepts `departmentId` as a parameter.
const useTestSession = (workerId) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(null);
    const [durationPerQuestion, setDurationPerQuestion] = useState(null);
    const [totalTestDuration, setTotalTestDuration] = useState(null); 
    const [testStartTime, setTestStartTime] = useState(null); 
    const [testAttemptId, setTestAttemptId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testStatus, setTestStatus] = useState('loading');

    // Function to load/resume the test session from the backend
    const loadTestSession = useCallback(async () => {
        // MODIFIED: The check now only verifies if `workerId` is present.
        if (!workerId) {
            setError('Worker ID missing.');
            setIsLoading(false);
            setTestStatus('error');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // MODIFIED: The API call no longer includes the `departmentId`.
            const response = await api.get(`/questions/${workerId}`);

            // MODIFIED: The check for department is removed.
            if (!response.data || !response.data.questionStartTime || !response.data.durationPerQuestion || !response.data.questions || !response.data.totalTestDuration || !response.data.testStartTime) {
                console.error('Backend response data is incomplete:', response.data);
                setError('Failed to load test session: Incomplete data from server.');
                setTestStatus('error');
                setIsLoading(false);
                return;
            }

            const {
                testAttemptId: fetchedTestAttemptId,
                currentQuestionIndex: fetchedIndex,
                questionStartTime: fetchedStartTime,
                durationPerQuestion: fetchedDuration,
                totalTestDuration: fetchedTotalDuration,
                testStartTime: fetchedTestStartTime,
                status: fetchedStatus,
                questions: fetchedQuestions,
            } = response.data;

            setTestAttemptId(fetchedTestAttemptId);
            setQuestions(fetchedQuestions);
            setCurrentQuestionIndex(fetchedIndex);
            setQuestionStartTime(new Date(fetchedStartTime));
            setDurationPerQuestion(fetchedDuration);
            setTotalTestDuration(fetchedTotalDuration);
            setTestStartTime(new Date(fetchedTestStartTime));
            setTestStatus(fetchedStatus);

        } catch (err) {
             setError(err.response?.data?.message || 'Failed to load test session.');
             setTestStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [workerId, setError, setIsLoading, setTestStatus]);

    // Function to update test progress on the backend
    const updateTestProgress = useCallback(async (newIndex, newStartTime) => {
        if (!testAttemptId) {
            console.error('Test Attempt ID is null. Cannot update progress.');
            return;
        }
        try {
            await api.put('/tests/progress', {
                testAttemptId,
                currentQuestionIndex: newIndex,
                questionStartTime: newStartTime.toISOString(),
            });
        } catch (err) {
            console.error('Failed to update test progress:', err);
        }
    }, [testAttemptId]);

    // Initial load when component mounts or worker ID changes
    useEffect(() => {
        loadTestSession();
    }, [loadTestSession]);
    
    return {
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        questionStartTime,
        setQuestionStartTime,
        durationPerQuestion,
        totalTestDuration,
        testStartTime,
        testAttemptId,
        updateTestProgress,
        isLoading,
        error,
        testStatus,
        setTestStatus,
        setIsLoading,
        setError,
        loadTestSession
    };
};

export default useTestSession;