import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, ArrowLeft, BarChart2, Hash } from 'lucide-react';
import Loader from '../../components/common/Loader';

function IndividualScoreboard() {
    const { workerId } = useParams();
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const fetchWorkerDetails = useCallback(async () => {
        try {
            // This assumes you have an endpoint to get a single worker's details
            // If not, you might need to fetch all workers and find the one by ID
            const res = await api.get(`/workers/${workerId}`);
            setWorker(res.data);
        } catch (err) {
            setError('Failed to load employee details.');
            console.error(err);
        }
    }, [workerId]);

    const fetchScores = useCallback(async (dateFilter) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ workerId });
            if (dateFilter) {
                params.append('date', dateFilter);
            }
            const res = await api.get(`/tests/scores?${params.toString()}`);
            setScores(res.data);
        } catch (err) {
            setError('Failed to load scores for this employee.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [workerId]);

    useEffect(() => {
        fetchWorkerDetails();
        fetchScores(); // Initial fetch without date filter
    }, [fetchWorkerDetails, fetchScores]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        fetchScores(e.target.value);
    };

    if (loading && !worker) {
        return <Loader />;
    }

    if (error && !worker) {
        return <p className="text-red-500 text-center mt-8">{error}</p>;
    }

    return (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
            <div className="mb-8">
            <button
                onClick={() => navigate('/admin/employee-scoreboard')}
                className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition"
            >
                <ArrowLeft size={18} />
                Back to Employee List
            </button>
            </div>

            {worker && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">{worker.name}'s Scoreboard</h1>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-600">
                            <p className="flex items-center gap-2"><Hash size={14} /> ID: {worker.workerId}</p>
                        </div>
                    </div>
                 )
             }

            <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700">Test History</h2>
                    <div className="relative self-start sm:self-center">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : error ? (
                     <p className="text-red-500 text-center py-4">{error}</p>
                    ) : scores.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {scores.map((attempt) => (
                                    <tr key={attempt._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(attempt.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {attempt.topic || 'General'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {attempt.score} / {attempt.totalQuestions}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                (attempt.score / attempt.totalQuestions) >= 0.75 ? 'bg-green-100 text-green-800' :
                                                (attempt.score / attempt.totalQuestions) >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No test attempts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {selectedDate ? "No tests were taken on this date." : "This employee has not taken any tests yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default IndividualScoreboard;