import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { FaSpinner } from 'react-icons/fa';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const cardRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/admin/login', { email, password });
            login(res.data, res.data.token);
            setTimeout(() => {
                navigate('/admin');
            }, 100);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#d1fae5]">
            {/* Animated floating gradient blobs */}
            <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-emerald-300 opacity-30 rounded-full blur-[100px] animate-float1 -z-10" />
            <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-green-400 opacity-30 rounded-full blur-[120px] animate-float2 -z-10" />
            {/* Centered login card */}
            <div
                ref={cardRef}
                className={`
                    glassy-card w-full max-w-sm px-8 py-10 rounded-3xl shadow-2xl relative flex flex-col items-center
                    ${shake ? 'animate-shake' : 'animate-cardpop'}
                `}
                tabIndex={-1}
            >
                {/* Logo */}
                <img src="data:image/jpeg;base64,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"
                 alt="Logo"
                className="w-20 h-20 mb-8 object-contain mx-auto rounded-full shadow-xl border-2 border-white bg-white/70"
                style={{ filter: "drop-shadow(0 0 32px #10b981)" }}
            />

            <h2 className="text-3xl font-extrabold text-gray-800 mb-10 text-center tracking-tight">
                Admin Login
            </h2>
            <form onSubmit={handleSubmit} className="space-y-9 w-full">
                <InputField
                    label="Email"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                />
                <InputField
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    isPassword
                    autoComplete="current-password"
                />
                {/* Inline error feedback */}
                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 pl-3 text-sm font-medium mt-2 animate-fadein">
                        {error}
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-70 flex items-center justify-center gap-3"
                >
                    {loading && <FaSpinner className="animate-spin" />}
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            <style>
                {`
                .glassy-card {
                    background: rgba(255,255,255,0.82);
                    backdrop-filter: blur(14px) saturate(120%);
                    border: 1.5px solid rgba(16,185,129,0.10);
                }
                .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%, 90% { transform: translateX(-1px);}
                    20%, 80% { transform: translateX(2px);}
                    30%, 50%, 70% { transform: translateX(-4px);}
                    40%, 60% { transform: translateX(4px);}
                }
                .animate-cardpop { animation: cardpop 0.7s cubic-bezier(.4,0,.2,1);}
                @keyframes cardpop {
                    0% { transform: scale(0.95) translateY(30px); opacity: 0.18; }
                    100% { transform: none; opacity: 1; }
                }
                .animate-float1 { animation: float1 6s infinite alternate; }
                .animate-float2 { animation: float2 8s infinite alternate; }
                @keyframes float1 { 0% { transform: translateY(0); } 100% { transform: translateY(70px); } }
                @keyframes float2 { 0% { transform: translateY(0); } 100% { transform: translateY(-60px); } }
                .input::placeholder { color: transparent !important; }
                `}
            </style>
            </div>
        </div>
    );
}

export default AdminLogin;
