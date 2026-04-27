// frontend/src/pages/ScoreboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ScoreboardPage() {
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedWorkerId, setSelectedWorkerId] = useState(''); // MODIFIED: New state for selected worker
    const [workers, setWorkers] = useState([]); // MODIFIED: New state to store the list of workers
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await api.get('/workers');
                setWorkers(res.data);
            } catch (err) {
                console.error("Failed to fetch workers:", err);
            }
        };
        fetchWorkers();
    }, []); // MODIFIED: New useEffect to fetch all workers once on mount

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            setError('');
            try {
                let url = '/tests/scores';
                const params = new URLSearchParams();
                
                if (selectedDate) {
                    params.append('date', selectedDate);
                }
                // MODIFIED: Add workerId to the query params if a worker is selected
                if (selectedWorkerId) {
                    params.append('workerId', selectedWorkerId);
                }

                if (params.toString()) {
                    url = `${url}?${params.toString()}`;
                }
                
                const res = await api.get(url);
                setScores(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load scoreboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, [selectedDate, selectedWorkerId]); // MODIFIED: Added selectedWorkerId as a dependency
    
    const getMedal = (index) => {
        if (index === 0) return '🥇'; // Gold meda  
        if (index === 1) return '🥈'; // Silver meda 
        if (index === 2) return '🥉'; // Bronze meda 
          return null;
      };
    // MODIFIED: Removed the getDeptColor and departmentColors since they are no longer needed
    const handleWorkerChange = (e) => {
        setSelectedWorkerId(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800 p-4 flex flex-col items-center relative">
            {/* Background blur for glassmorphism */}
            <style>
                {`
                @media (max-width: 640px) {
                  .hide-on-mobile { display: none !important; }
                }
                .glassy-card {
                    background: rgba(255, 255, 255, 0.90);
                    backdrop-filter: blur(12px) saturate(140%);
                    box-shadow: 0 6px 48px 0 rgba(16, 185, 129, 0.07), 0 1.5px 10px 0 rgba(0,0,0,0.08);
                }
              `}
            </style>
            <div className="w-full max-w-5xl mx-auto my-8 px-2 sm:px-4 py-4 glassy-card rounded-2xl shadow-2xl">
                {/* NEW: Back button added here */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center tracking-tight">Scoreboard</h1>
                {/* Sticky filter bar */}
                <div className="sticky top-0 z-10 mb-4 bg-white bg-opacity-80 rounded-xl shadow-sm p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {/* MODIFIED: Added the new Select Employee dropdown */}
                        <select
                            value={selectedWorkerId}
                            onChange={handleWorkerChange}
                            className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-green-200 bg-white"
                        >
                            <option value="">All Employees</option>
                            {workers.map(worker => (
                                <option key={worker._id} value={worker._id}>{worker.name}</option>
                            ))}
                        </select>
                        {/* NEW: Date selection input */}
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-green-200 bg-white"
                        />
                    </div>
                </div>

                {loading ? (
                    // Animated loader with glass effect
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="w-14 h-14 animate-spin mb-3 text-green-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="text-green-700 font-semibold text-lg">Loading scoreboard...</span>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-600 font-semibold py-8">{error}</p>
                ) : scores.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                        <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-3 text-green-200">
                            <path fill="currentColor" d="M12 21c5 0 9-3.58 9-8s-4-8-9-8-9 3.58-9 8 4 8 9 8zm0-2c-3.87 0-7-2.91-7-6s3.13-6 7-6 7 2.91 7 6-3.13 6-7 6zm-1-9v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                        </svg>
                        <p className="text-gray-600 text-xl font-medium">No scores available yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">EMPLOYEE NAME</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hide-on-mobile">EMPLOYEE ID</th>
                                    {/* The Department header is removed */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">Score / Total Q's</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {scores
                                    .sort((a, b) => {
                                        // Sort based on `score` if a date or specific worker is selected, else `totalScore`
                                        const scoreA = selectedDate || selectedWorkerId ? a.score : a.totalScore;
                                        const scoreB = selectedDate || selectedWorkerId ? b.score : b.totalScore;
                                        return scoreB - scoreA;
                                    })
                                    .map((scoreEntry, idx) => {
                                        const medal = getMedal(idx);
                                        // The department badge and color logic is removed
                                        // Highlight for top 3
                                        const highlight =
                                            idx === 0
                                                ? 'bg-lime-50'
                                                : idx === 1
                                                ? 'bg-gray-100'
                                                : idx === 2
                                                ? 'bg-amber-50'
                                                : '';
                                        return (
                                            <tr
                                                key={scoreEntry._id || scoreEntry.worker?._id} // MODIFIED: Fallback to worker ID if main _id is missing
                                                className={`transition hover:bg-green-50 ${highlight}`}
                                                style={{ boxShadow: idx < 3 ? '0 2px 12px 0 rgba(22, 163, 74, 0.06)' : undefined }}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-lg font-bold">
                                                    {medal ? (
                                                        <span className="mr-1" title={medal ==='🥇'? 'Top scorer' : ''}>{medal}</span>                          
                                                    ) : (
                                                        <span className="text-gray-500 font-medium">{idx + 1}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-semibold">
                                                    {scoreEntry.worker ? scoreEntry.worker.name : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 hide-on-mobile">
                                                    {scoreEntry.worker ? scoreEntry.worker.workerId : 'N/A'}
                                                </td>
                                                {/* The department badge cell is removed */}
                                                <td className="px-4 py-3 whitespace-nowrap text-green-800 font-bold text-lg">
                                                    {/* MODIFIED: Display score as X/Y if a date or specific worker is selected, else cumulative total */}
                                                    {(selectedDate || selectedWorkerId)
                                                        ? `${scoreEntry.score} / ${scoreEntry.totalQuestions}` // Show score/totalQuestions for that day
                                                        : `${scoreEntry.totalScore} / ${scoreEntry.totalPossibleScore}`} {/* Show cumulative score/totalPossibleScore*/}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Glassmorphism style */}
        </div>
    );
}
export default ScoreboardPage;