// frontend/src/layouts/WorkerLayout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Button from '../components/common/Button'; // Assuming you have a Button component

function WorkerLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/worker/login');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Worker Header/Navbar */}
            <header className="bg-green-700 text-white p-4 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold">Welcome, {user?.name || 'Worker'}!</h1>
                <nav>
                    <Button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                        Logout
                    </Button>
                </nav>
            </header>
    
            {/* Main Content Area where nested routes will render */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet /> {/* This is where the child routes (like WorkerDashboard or WorkerTestPage) will be rendered */}
            </main>
        </div>
    );
}

export default WorkerLayout;