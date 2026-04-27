// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth.jsx';
// import {
//     Users, Sparkles, Trophy, ArrowRight, Clock,
//     TrendingUp, Award, Activity, BarChart3, Star, Zap
// } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import api from '../../services/api';

// function AdminDashboard() {
//     const { user } = useAuth();
//     const [currentTime, setCurrentTime] = useState(new Date());
//     const [loading, setLoading] = useState(true);
//     const [stats, setStats] = useState({
//         totalEmployees: 0,
//         questionsGenerated: 0,
//         activeTests: 0,
//         avgScore: 0,
//         topPerformer: 'N/A',
//         latestTopic: 'N/A',
//     });

//     useEffect(() => {
//         const fetchDashboardData = async () => {
//             setLoading(true);
//             try {
//                 // Fetch all necessary data in parallel for efficiency
//                 const [workersRes, questionsStatsRes, scoresRes, allAttemptsRes] = await Promise.all([
//                     api.get('/workers'),
//                     api.get('/questions/stats'),
//                     api.get('/tests/scores'), // This gets completed tests for scoreboard stats
//                     api.get('/tests/scores?date=&workerId=') // Gets all attempts to count active ones
//                 ]);

//                 // 1. Calculate Total Employees
//                 const totalEmployees = workersRes.data?.length || 0;

//                 // 2. Get Total Questions Generated
//                 const questionsGenerated = questionsStatsRes.data?.summary?.totalQuestions || 0;

//                 // 3. Find Active (In-Progress) Tests
//                 const activeTests = allAttemptsRes.data.filter(attempt => attempt.status === 'in-progress').length;

//                 // 4. Calculate Average Score from all completed tests
//                 const completedScores = scoresRes.data;
//                 let avgScore = 0;
//                 if (completedScores && completedScores.length > 0) {
//                     const totalScoreSum = completedScores.reduce((acc, curr) => acc + curr.totalScore, 0);
//                     const totalPossibleScoreSum = completedScores.reduce((acc, curr) => acc + curr.totalPossibleScore, 0);
//                     if (totalPossibleScoreSum > 0) {
//                         avgScore = Math.round((totalScoreSum / totalPossibleScoreSum) * 100);
//                     }
//                 }

//                 // 5. Find the Top Performer
//                 const topPerformer = completedScores.length > 0 ? completedScores[0].worker.name : 'N/A';

//                 // 6. Find the Latest Topic by fetching the most recent question
//                 const questionsHistory = await api.get('/questions');
//                 const latestTopic = questionsHistory.data.questions.length > 0
//                     ? questionsHistory.data.questions[0].topic
//                     : 'N/A';

//                 setStats({
//                     totalEmployees,
//                     questionsGenerated,
//                     activeTests,
//                     avgScore,
//                     topPerformer,
//                     latestTopic
//                 });

//             } catch (error) {
//                 console.error("Failed to fetch dashboard data:", error);
//                 // Optionally, set an error state here to display a message to the user
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchDashboardData();
//     }, []);


//     // Update time every minute
//     useEffect(() => {
//         const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//         return () => clearInterval(timer);
//     }, []);

//     const formatTime = (date) => {
//         return date.toLocaleTimeString('en-US', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         });
//     };

//     const formatDate = (date) => {
//         return date.toLocaleDateString('en-US', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };
    
//     // --- DYNAMIC DATA SECTION ---
//     const shortcuts = [
//         {
//             title: "Manage Employees",
//             description: "Add, edit, or remove employee accounts from the system.",
//             icon: <Users className="w-8 h-8" />,
//             color: "from-green-500 via-emerald-500 to-teal-500",
//             shadowColor: "shadow-green-500/30",
//             stats: `${stats.totalEmployees} Active`,
//             link: "/admin/workers"
//         },
//         {
//             title: "Generate Questions",
//             description: "Generate AI-based MCQ questions for your employees.",
//             icon: <Sparkles className="w-8 h-8" />,
//             color: "from-purple-500 via-violet-500 to-purple-600",
//             shadowColor: "shadow-purple-500/30",
//             stats: `${stats.questionsGenerated} Generated`,
//             link: "/admin/questions"
//         },
//         {
//             title: "View Scoreboard",
//             description: "Track performance on the cumulative scoreboard.",
//             icon: <Trophy className="w-8 h-8" />,
//             color: "from-amber-500 via-orange-500 to-red-500",
//             shadowColor: "shadow-amber-500/30",
//             stats: "View Rankings",
//             link: "/scoreboard"
//         }
//     ];

//     const quickStats = [
//         { label: "Total Employees", value: stats.totalEmployees, icon: <Users className="w-5 h-5" />, color: "text-green-600" },
//         { label: "Questions Generated", value: stats.questionsGenerated, icon: <Sparkles className="w-5 h-5" />, color: "text-purple-600" },
//         { label: "Active Tests", value: stats.activeTests, icon: <Activity className="w-5 h-5" />, color: "text-blue-600" },
//         { label: "Avg. Score", value: `${stats.avgScore}%`, icon: <Star className="w-5 h-5" />, color: "text-amber-600" }
//     ];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
//             <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl -translate-x-48 -translate-y-48" />
//             <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-200/20 to-transparent rounded-full blur-3xl translate-x-48 translate-y-48" />

//             <div className="relative z-10 p-4 sm:p-6 lg:p-8">
//                 <div className="mb-8 lg:mb-12">
//                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
//                         <div>
//                             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
//                                 Welcome back, {user?.name || 'Admin'}! 👋
//                             </h1>
//                             <p className="text-lg sm:text-xl text-emerald-700 font-medium">
//                                 Ready to manage your team today?
//                             </p>
//                         </div>
//                         <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6 shadow-lg">
//                             <div className="flex items-center gap-3 mb-2">
//                                 <Clock className="w-5 h-5 text-emerald-600" />
//                                 <span className="text-sm font-medium text-emerald-700">Current Time</span>
//                             </div>
//                             <div className="text-2xl lg:text-3xl font-bold text-emerald-800">
//                                 {formatTime(currentTime)}
//                             </div>
//                             <div className="text-sm text-emerald-600 mt-1">
//                                 {formatDate(currentTime)}
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
//                         {quickStats.map((stat, index) => (
//                             <div
//                                 key={stat.label}
//                                 className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                             >
//                                 <div className="flex items-center justify-between mb-2">
//                                     <div className={`p-2 rounded-lg bg-gradient-to-r from-white to-gray-50 ${stat.color}`}>
//                                         {stat.icon}
//                                     </div>
//                                 </div>
//                                 <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
//                                     {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div> : stat.value}
//                                 </div>
//                                 <div className="text-xs sm:text-sm text-gray-600 font-medium">
//                                     {stat.label}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
//                     {shortcuts.map((item) => (
//                         <Link
//                             to={item.link}
//                             key={item.title}
//                             className={`group relative bg-gradient-to-br ${item.color} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl ${item.shadowColor} hover:shadow-3xl transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer overflow-hidden block`}
//                         >
//                             <div className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
//                             <div className="relative z-10 h-full flex flex-col justify-between">
//                                 <div>
//                                     <div className="flex items-center justify-between mb-4">
//                                         <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
//                                             <span className="text-white/90 text-sm font-medium">
//                                                 {loading ? <div className="h-5 bg-white/30 rounded animate-pulse w-20"></div> : item.stats}
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">{item.title}</h3>
//                                     <p className="text-white/90 leading-relaxed text-sm sm:text-base mb-6">{item.description}</p>
//                                 </div>
//                                 <div className="flex items-center justify-between mt-auto">
//                                     <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 group">
//                                         Go to Page
//                                         <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>

//                 <div className="mt-8 lg:mt-12">
//                     <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
//                         <div className="flex items-center justify-between mb-6">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-white">
//                                     <BarChart3 className="w-6 h-6" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quick Overview</h2>
//                                     <p className="text-gray-600">Your dashboard at a glance</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                             <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
//                                 <div className="flex items-center gap-3 mb-2">
//                                     <Award className="w-5 h-5 text-green-600" />
//                                     <span className="font-semibold text-green-800">Top Performer</span>
//                                 </div>
//                                 <p className="text-gray-700 font-medium">
//                                     {loading ? <div className="h-5 bg-green-200 rounded animate-pulse w-3/5"></div> : stats.topPerformer}
//                                 </p>
//                             </div>

//                             <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl p-4 border border-purple-200">
//                                 <div className="flex items-center gap-3 mb-2">
//                                     <Sparkles className="w-5 h-5 text-purple-600" />
//                                     <span className="font-semibold text-purple-800">Latest Topic Generated</span>
//                                 </div>
//                                 <p className="text-gray-700 font-medium">
//                                     {loading ? <div className="h-5 bg-purple-200 rounded animate-pulse w-4/5"></div> : stats.latestTopic}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import {
    Users, Sparkles, Trophy, ArrowRight, Clock,
    TrendingUp, Award, Activity, BarChart3, Star, Zap,
    Briefcase, Brain, Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function AdminDashboard() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        questionsGenerated: 0,
        activeTests: 0,
        avgScore: 0,
        topPerformer: 'N/A',
        latestTopic: 'N/A',
    });
    const [animatedNumbers, setAnimatedNumbers] = useState({
        totalEmployees: 0,
        questionsGenerated: 0,
        activeTests: 0,
        avgScore: 0
    });

    // --- DATA FETCHING ---
    // This hook runs once when the component loads to fetch all necessary data.
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch all data points in parallel for maximum efficiency.
                const [workersRes, questionsStatsRes, scoresRes, allAttemptsRes, questionsHistoryRes] = await Promise.all([
                    api.get('/workers'),
                    api.get('/questions/stats'),
                    api.get('/tests/scores'), // Gets scoreboard data (completed tests)
                    api.get('/tests/scores?date=&workerId='), // Gets all attempts to count active ones
                    api.get('/questions') // Gets question history to find the latest topic
                ]);

                // 1. Calculate Total Employees
                const totalEmployees = workersRes.data?.length || 0;

                // 2. Get Total Questions Generated
                const questionsGenerated = questionsStatsRes.data?.summary?.totalQuestions || 0;

                // 3. Find Active (In-Progress) Tests
                const activeTests = allAttemptsRes.data.filter(attempt => attempt.status === 'in-progress').length;

                // 4. Calculate Average Score from all completed tests
                const completedScores = scoresRes.data;
                let avgScore = 0;
                if (completedScores && completedScores.length > 0) {
                    const totalScoreSum = completedScores.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
                    const totalPossibleScoreSum = completedScores.reduce((acc, curr) => acc + (curr.totalPossibleScore || 0), 0);
                    if (totalPossibleScoreSum > 0) {
                        avgScore = Math.round((totalScoreSum / totalPossibleScoreSum) * 100);
                    }
                }

                // 5. Find the Top Performer from the scoreboard data (which is pre-sorted by score)
                const topPerformer = completedScores.length > 0 ? completedScores[0].worker.name : 'N/A';

                // 6. Find the Latest Topic from the most recent question
                const latestTopic = questionsHistoryRes.data.questions.length > 0
                    ? questionsHistoryRes.data.questions[0].topic
                    : 'N/A';

                setStats({
                    totalEmployees,
                    questionsGenerated,
                    activeTests,
                    avgScore,
                    topPerformer,
                    latestTopic
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                // You can set a global error state here to show a toast or message
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- ANIMATION EFFECT ---
    // This effect creates the "counting up" animation for the numbers once data is loaded.
    useEffect(() => {
        if (!loading) {
            const duration = 1500; // Animation duration in ms
            const steps = 50;
            const stepDuration = duration / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                // An ease-out function makes the animation start fast and slow down at the end.
                const easeOut = 1 - Math.pow(1 - progress, 4);

                setAnimatedNumbers({
                    totalEmployees: Math.floor(stats.totalEmployees * easeOut),
                    questionsGenerated: Math.floor(stats.questionsGenerated * easeOut),
                    activeTests: Math.floor(stats.activeTests * easeOut),
                    avgScore: Math.floor(stats.avgScore * easeOut)
                });

                if (currentStep >= steps) {
                    clearInterval(timer);
                    // Ensure the final numbers are exact
                    setAnimatedNumbers({
                        totalEmployees: stats.totalEmployees,
                        questionsGenerated: stats.questionsGenerated,
                        activeTests: stats.activeTests,
                        avgScore: stats.avgScore
                    });
                }
            }, stepDuration);

            return () => clearInterval(timer);
        }
    }, [loading, stats]);


    // --- TIME & DATE ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // --- DYNAMIC UI DATA ---
    // These arrays now use the live data from the 'stats' and 'animatedNumbers' states.
    const shortcuts = [
        {
            title: "Manage Employees",
            description: "Add, edit, or remove employee accounts from the system.",
            icon: <Users className="w-8 h-8" />,
            floatingIcon: <Briefcase className="w-6 h-6" />,
            color: "from-green-500 via-emerald-500 to-teal-500",
            shadowColor: "shadow-green-500/30",
            stats: `${animatedNumbers.totalEmployees} Active`,
            link: "/admin/workers"
        },
        {
            title: "Generate Questions",
            description: "Generate AI-based MCQ questions for your employees.",
            icon: <Sparkles className="w-8 h-8" />,
            floatingIcon: <Brain className="w-6 h-6" />,
            color: "from-purple-500 via-violet-500 to-purple-600",
            shadowColor: "shadow-purple-500/30",
            stats: `${animatedNumbers.questionsGenerated} Generated`,
            link: "/admin/questions"
        },
        {
            title: "View Scoreboard",
            description: "Track performance on the cumulative scoreboard.",
            icon: <Trophy className="w-8 h-8" />,
            floatingIcon: <Crown className="w-6 h-6" />,
            color: "from-amber-500 via-orange-500 to-red-500",
            shadowColor: "shadow-amber-500/30",
            stats: "View Rankings",
            link: "/scoreboard"
        }
    ];

    const quickStats = [
        { label: "Total Employees", value: animatedNumbers.totalEmployees, icon: <Users className="w-5 h-5" />, color: "text-green-600" },
        { label: "Questions Generated", value: animatedNumbers.questionsGenerated, icon: <Sparkles className="w-5 h-5" />, color: "text-purple-600" },
        { label: "Active Tests", value: animatedNumbers.activeTests, icon: <Activity className="w-5 h-5" />, color: "text-blue-600" },
        { label: "Avg. Score", value: `${animatedNumbers.avgScore}%`, icon: <Star className="w-5 h-5" />, color: "text-amber-600" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl -translate-x-48 -translate-y-48" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-200/20 to-transparent rounded-full blur-3xl translate-x-48 translate-y-48" />

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                Welcome back, {user?.name || 'Admin'}! 👋
                            </h1>
                            <p className="text-lg sm:text-xl text-emerald-700 font-medium">
                                Here's what's happening with your team today.
                            </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">Current Time</span>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-emerald-800 font-mono">
                                {formatTime(currentTime)}
                            </div>
                            <div className="text-sm text-emerald-600 mt-1">
                                {formatDate(currentTime)}
                            </div>
                        </div>
                    </div>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
                        {quickStats.map((stat) => (
                            <div key={stat.label} className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-lg bg-gradient-to-r from-white to-gray-50 ${stat.color}`}>{stat.icon}</div>
                                </div>
                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                                    {loading ? <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div> : stat.value}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {shortcuts.map((item) => (
                        <Link to={item.link} key={item.title} className={`group relative bg-gradient-to-br ${item.color} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl ${item.shadowColor} hover:shadow-3xl transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer overflow-hidden block`}>
                            <div className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{item.icon}</div>
                            <div className="relative z-10 h-full flex flex-col justify-between min-h-[180px]">
                                <div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 inline-block mb-4">
                                        <span className="text-white/90 text-sm font-medium">
                                            {loading ? <div className="h-5 bg-white/30 rounded animate-pulse w-20"></div> : item.stats}
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">{item.title}</h3>
                                    <p className="text-white/90 leading-relaxed text-sm sm:text-base mb-6">{item.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2">
                                        Go to Page <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8 lg:mt-12">
                    <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-white">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quick Overview</h2>
                                    <p className="text-gray-600">Your dashboard at a glance</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-800">Top Performer</span>
                                </div>
                               <div>
    {loading ? <div className="h-5 bg-green-200 rounded animate-pulse w-3/5"></div> : stats.topPerformer}
</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold text-purple-800">Latest Topic Generated</span>
                                </div>
                              <div>
    {loading ? <div className="h-5 bg-purple-200 rounded animate-pulse w-4/5"></div> : stats.latestTopic}
</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
