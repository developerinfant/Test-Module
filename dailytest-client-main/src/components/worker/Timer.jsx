// frontend/src/components/worker/Timer.jsx
import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        // Only start timer if initialTime is a positive number
        if (initialTime > 0) {
            setTimeLeft(initialTime); // Reset timeLeft when initialTime changes (e.g., new question)
            const timerInterval = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) { // Stops at 0
                        clearInterval(timerInterval);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timerInterval); // Cleanup on unmount or initialTime change
        } else {
            setTimeLeft(0); // If initialTime is 0 or negative, set to 0 immediately
        }
    }, [initialTime]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
            Time Left: {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;