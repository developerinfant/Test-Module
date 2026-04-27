import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { User, ChevronsRight } from 'lucide-react';
import Loader from '../../components/common/Loader';

function EmployeeScoreboardList() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true);
                const res = await api.get('/workers');
                // Sort workers by name alphabetically
                const sortedWorkers = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setWorkers(sortedWorkers);
            } catch (err) {
                setError('Failed to load employees. Please try again later.');
                console.error("Error fetching workers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    const filteredWorkers = useMemo(() => {
        return workers.filter(worker =>
            worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.workerId.toLowerCase().includes(searchTerm.toLowerCase())
            // MODIFIED: Removed the department filter as it is no longer in the schema
        );
    }, [workers, searchTerm]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-red-500 text-center mt-8">{error}</p>;
    }

    return (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Scoreboard</h1>
            <p className="text-gray-600 mb-8">Select an employee to view their detailed test history and scores.</p>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {filteredWorkers.length > 0 ? (
                        filteredWorkers.map(worker => (
                            <li key={worker._id}>
                                <Link
                                    to={`/admin/employee-scoreboard/${worker._id}`}
                                    className="flex items-center justify-between p-4 hover:bg-green-50 transition duration-150 ease-in-out group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <User className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg text-gray-800 group-hover:text-green-700">{worker.name}</p>
                                            <p className="text-sm text-gray-500">
                                                ID: {worker.workerId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* MODIFIED: The department tag is removed from the JSX */}
                                        <ChevronsRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="p-6 text-center text-gray-500">
                            No employees found matching your search.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default EmployeeScoreboardList;