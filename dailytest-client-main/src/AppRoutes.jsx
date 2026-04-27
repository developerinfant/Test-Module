// frontend/src/AppRoutes.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { AnimatePresence, motion } from 'framer-motion';

// --- Import your components ---
import AdminLogin from './pages/auth/AdminLogin';
import WorkerLogin from './pages/auth/WorkerLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageWorkers from './pages/admin/ManageWorkers';
import GenerateQuestions from './pages/admin/GenerateQuestions';
import QuestionHistory from './pages/admin/QuestionHistory';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTestPage from './pages/worker/WorkerTestPage';
import ScoreboardPage from './pages/ScoreboardPage';
import NotFound from './pages/NotFound';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import WorkerLayout from './layouts/WorkerLayout';
import Loader from './components/common/Loader';
import EmployeeScoreboardList from './pages/admin/EmployeeScoreboardList';
import IndividualScoreboard from './pages/admin/IndividualScoreboard';

const AnimatedRoute = ({ children }) => {
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };
    const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.4 };
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
};

function AppRoutes() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            const publicPaths = ['/', '/admin/login', '/worker/login', '/scoreboard'];
            const currentPath = window.location.pathname;
            const isPublic = publicPaths.some(path => currentPath.startsWith(path));
            if (!isPublic) {
                navigate('/');
            }
        }
    }, [isLoading, user, navigate]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
                <Route path="/admin/login" element={<AnimatedRoute><AuthLayout><AdminLogin /></AuthLayout></AnimatedRoute>} />
                <Route path="/worker/login" element={<AnimatedRoute><AuthLayout><WorkerLogin /></AuthLayout></AnimatedRoute>} />

                <Route path="/admin/*" element={user && user.role === 'admin' ? <AdminLayout /> : <Navigate to="/admin/login" replace />}>
                    <Route index element={<AnimatedRoute><AdminDashboard /></AnimatedRoute>} />
                    <Route path="workers" element={<AnimatedRoute><ManageWorkers /></AnimatedRoute>} />
                    <Route path="questions" element={<AnimatedRoute><GenerateQuestions /></AnimatedRoute>} />
                    <Route path="question-history" element={<AnimatedRoute><QuestionHistory /></AnimatedRoute>} />
                    <Route path="employee-scoreboard" element={<AnimatedRoute><EmployeeScoreboardList /></AnimatedRoute>} />
                    <Route path="employee-scoreboard/:workerId" element={<AnimatedRoute><IndividualScoreboard /></AnimatedRoute>} />
                </Route>

                <Route path="/worker/*" element={user && user.role === 'worker' ? <WorkerLayout /> : <Navigate to="/worker/login" replace />}>
                    <Route index element={<AnimatedRoute><WorkerDashboard /></AnimatedRoute>} />
                    <Route path=":workerId/test" element={<AnimatedRoute><WorkerTestPage /></AnimatedRoute>} />
                </Route>

                <Route path="/scoreboard" element={<AnimatedRoute><ScoreboardPage /></AnimatedRoute>} />
                <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
            </Routes>
        </AnimatePresence>
    );
}

export default AppRoutes;