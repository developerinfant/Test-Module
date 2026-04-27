import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import {
    Plus, X, BookOpen, UserCheck, Settings, ChevronDown, ChevronUp,
    Search, Users, Clock, Zap, Target, Calendar, AlertCircle, CheckCircle,
    Filter, RefreshCw, Download, AlertTriangle, Loader2
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';

// --- FINALIZED: Live Progress Indicator Component ---
const ProgressIndicator = ({ progress, totalWorkers, totalQuestions }) => {
    // This component will only show if generation is in progress OR it has just finished
    if (!progress.isGenerating && progress.percentage < 100) return null;

    const isFinished = !progress.isGenerating && progress.percentage === 100;

    // Calculate statistics from the polled data
    const completedWorkers = progress.result?.results?.length || 0;
    const failedWorkers = progress.result?.failedWorkers?.length || 0;
    const processedWorkers = completedWorkers + failedWorkers;
    const questionsGenerated = progress.result?.totalQuestionsGenerated || 0;

    return (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-6 z-50 w-full max-w-sm border-t-4 border-green-500 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg">
                    {isFinished ? 'Generation Complete!' : 'Generation In Progress'}
                </h4>
                {isFinished ? (
                     <CheckCircle className="text-green-600" size={24} />
                ) : (
                    <Loader2 className="animate-spin text-green-600" size={24} />
                )}
            </div>

            <div className="space-y-3">
                {/* Overall Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                        <span>Overall Progress</span>
                        <span className="font-semibold text-green-700">{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                        ></div>
                    </div>
                </div>
                
                {/* Counters will now show the final values */}
                <div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Employees Processed</span>
                        <span className="font-semibold">{processedWorkers} / {totalWorkers}</span>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Questions Generated</span>
                        <span className="font-semibold">{questionsGenerated} / {totalQuestions}</span>
                    </div>
                </div>
            </div>

            {failedWorkers > 0 && (
                <div className="mt-3 text-xs text-red-600 font-semibold">
                    {failedWorkers} employee(s) encountered an issue.
                </div>
            )}
             <p className="text-xs text-gray-500 mt-4">
                {isFinished ? 'Process finished. You can close this widget.' : 'This is running in the background. You can navigate away from this page.'}
             </p>
        </div>
    );
};


const Card = ({ title, children, icon: Icon, className = "", headerActions }) => (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${className}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
            <div className="flex items-center">
                {Icon && <Icon className="text-green-600 mr-3" size={24} />}
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Alert = ({ type, message, onClose, children }) => {
    const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200';
    const textColor = type === 'error' ? 'text-red-700' : type === 'warning' ? 'text-orange-700' : 'text-green-700';
    const iconColor = type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-orange-500' : 'text-green-500';
    const Icon = type === 'error' ? AlertCircle : type === 'warning' ? AlertTriangle : CheckCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${bgColor} border rounded-xl p-4 mb-6 flex items-start gap-3`}
        >
            <Icon className={`${iconColor} mt-0.5 flex-shrink-0`} size={20} />
            <div className="flex-1">
                {typeof message === 'string' ? (<p className={`${textColor} text-sm leading-relaxed`}>{message}</p>) : (<div className={`${textColor} text-sm leading-relaxed`}>{message}</div>)}
                {children}
            </div>
            {onClose && (<button type="button" onClick={onClose} className={`${iconColor} hover:opacity-70`}><X size={16} /></button>)}
        </motion.div>
    );
};

const EmployeeMultiSelect = ({ workers, selectedWorkers, onSelectChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const dropdownRef = useRef(null);

    const filteredAndSortedWorkers = workers.filter(worker => worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || worker.workerId?.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'workerId') return (a.workerId || '').localeCompare(b.workerId || '');
        return 0;
    });

    const handleSelectAll = (e) => onSelectChange(e.target.checked ? filteredAndSortedWorkers.map(w => w._id) : []);
    const handleIndividualSelect = (workerId) => onSelectChange(selectedWorkers.includes(workerId) ? selectedWorkers.filter(id => id !== workerId) : [...selectedWorkers, workerId]);
    const handleRemoveTag = (workerId) => onSelectChange(selectedWorkers.filter(id => id !== workerId));
    const clearAll = () => onSelectChange([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedWorkerData = selectedWorkers.map(id => workers.find(w => w._id === id)).filter(Boolean);

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {selectedWorkerData.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center"><UserCheck className="text-green-600 mr-2" size={18} /><span className="text-sm font-semibold text-green-800">Selected Employees ({selectedWorkerData.length})</span></div>
                            <button type="button" onClick={clearAll} className="text-green-600 hover:text-red-600 transition-colors text-sm font-medium">Clear All</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedWorkerData.map(worker => (
                                <span key={worker._id} className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>{worker.name}
                                    <button type="button" onClick={() => handleRemoveTag(worker._id)} className="ml-2 text-green-600 hover:text-red-600 transition-colors"><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="relative" ref={dropdownRef}>
                <div className={`p-4 border-2 rounded-xl cursor-pointer flex items-center justify-between min-h-[60px] transition-all duration-200 hover:border-green-300 ${error ? 'border-red-300 bg-red-50' : isOpen ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`} onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex items-center"><Users className="text-gray-500 mr-3" size={20} /><span className={selectedWorkerData.length > 0 ? 'text-gray-700' : 'text-gray-400'}>{selectedWorkerData.length > 0 ? `${selectedWorkerData.length} employee${selectedWorkerData.length > 1 ? 's' : ''} selected` : 'Click to select employees...'}</span></div>
                    <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isOpen ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b"><div className="space-y-3"><div className="relative"><Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} /></div><div className="flex items-center justify-between"><div className="flex items-center space-x-3"><Filter size={16} className="text-gray-500" /><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none" onClick={(e) => e.stopPropagation()}><option value="name">Sort by Name</option><option value="workerId">Sort by ID</option></select></div><span className="text-sm text-gray-500">{filteredAndSortedWorkers.length} employee{filteredAndSortedWorkers.length !== 1 ? 's' : ''}</span></div></div></div>
                            <div className="p-3 border-b border-gray-100 bg-blue-50"><label className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded-lg transition-colors"><input type="checkbox" checked={selectedWorkers.length === filteredAndSortedWorkers.length && filteredAndSortedWorkers.length > 0} onChange={handleSelectAll} className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-2" /><span className="ml-3 font-semibold text-blue-800">Select All Filtered Employees</span><span className="ml-2 text-blue-600 text-sm">({filteredAndSortedWorkers.length})</span></label></div>
                            <div className="max-h-64 overflow-y-auto">{filteredAndSortedWorkers.length > 0 ? (filteredAndSortedWorkers.map(worker => (<div key={worker._id} className="border-b border-gray-50 last:border-b-0"><label className="flex items-center w-full p-4 hover:bg-gray-50 cursor-pointer transition-colors"><input type="checkbox" checked={selectedWorkers.includes(worker._id)} onChange={() => handleIndividualSelect(worker._id)} className="form-checkbox h-5 w-5 text-green-600 focus:ring-green-500 rounded border-2" /><div className="ml-3 flex-1"><div className="flex items-center justify-between"><div><div className="font-medium text-gray-900">{worker.name}</div><div className="text-sm text-gray-500">ID: {worker.workerId || 'N/A'} {worker.registrationType === 'self' && <span className="text-blue-600 ml-1">• Self-registered</span>}</div></div>{selectedWorkers.includes(worker._id) && (<CheckCircle className="text-green-500" size={16} />)}</div></div></label></div>))) : (<div className="p-8 text-center text-gray-500"><Users size={24} className="mx-auto mb-2 opacity-50" /><p>No employees found matching your search.</p></div>)}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const IndividualEmployeeTopics = ({ workers, individualTopics, selectedWorkers, onUpdateTopics }) => {
    const [expandedEmployees, setExpandedEmployees] = useState(new Set());
    const [editingWorker, setEditingWorker] = useState(null);
    const [manualTopicInput, setManualTopicInput] = useState('');
    const [isListVisible, setIsListVisible] = useState(false);

    const toggleEmployee = (workerId) => {
        const newExpanded = new Set(expandedEmployees);
        newExpanded.has(workerId) ? newExpanded.delete(workerId) : newExpanded.add(workerId);
        setExpandedEmployees(newExpanded);
    };

    const handleManualTopicSave = (workerId) => {
        const topics = manualTopicInput.split(',').map(t => t.trim()).filter(Boolean);
        if (topics.length > 0) {
            onUpdateTopics(workerId, topics);
            setEditingWorker(null);
            setManualTopicInput('');
        }
    };

    const employeesWithoutTopics = useMemo(() =>
        selectedWorkers.filter(id => !individualTopics[id] || individualTopics[id].length === 0).length
    , [selectedWorkers, individualTopics]);

    if (Object.keys(individualTopics).length === 0) return null;

    return (
        <div className="mt-6">
            <button
                type="button"
                onClick={() => setIsListVisible(!isListVisible)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border transition-all"
            >
                <div className="font-semibold text-gray-700">
                    View/Edit Topics for {selectedWorkers.length} Selected Employees
                    {employeesWithoutTopics > 0 && (
                        <span className="ml-2 text-sm text-orange-600">({employeesWithoutTopics} missing topics)</span>
                    )}
                </div>
                {isListVisible ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
            </button>
            <AnimatePresence>
            {isListVisible && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-4 overflow-hidden">
                    {selectedWorkers.map(workerId => {
                        const worker = workers.find(w => w._id === workerId);
                        const topics = individualTopics[workerId] || [];
                        const isExpanded = expandedEmployees.has(workerId);
                        const isEditing = editingWorker === workerId;

                        return (
                            <div key={workerId} className={`border rounded-xl overflow-hidden ${topics.length === 0 ? 'border-orange-200' : 'border-gray-200'}`}>
                                <div role="button" tabIndex={0} onClick={() => toggleEmployee(workerId)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleEmployee(workerId)} className={`w-full p-4 cursor-pointer ${topics.length === 0 ? 'bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100' : 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100'} transition-all duration-200 flex items-center justify-between`}>
                                    <div className="flex items-center"><div className={`w-10 h-10 ${topics.length === 0 ? 'bg-orange-200' : 'bg-green-200'} rounded-full flex items-center justify-center mr-3`}><span className={`font-bold ${topics.length === 0 ? 'text-orange-800' : 'text-green-800'} text-sm`}>{worker?.name?.charAt(0)?.toUpperCase() || '?'}</span></div><div className="text-left"><div className="font-semibold text-gray-800">{worker?.name || 'Unknown'}</div><div className={`text-sm ${topics.length === 0 ? 'text-orange-600' : 'text-gray-600'}`}>{topics.length === 0 ? '⚠️ No topics - click to add' : `${topics.length} topic${topics.length !== 1 ? 's' : ''} found`}</div></div></div>
                                    <div className="flex items-center space-x-2">{topics.length === 0 && (<button type="button" onClick={(e) => { e.stopPropagation(); setEditingWorker(workerId); setManualTopicInput(''); }} className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600">Add Topics</button>)}<span className={`${topics.length === 0 ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'} px-2 py-1 rounded-full text-xs font-medium`}>{topics.length}</span>{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                                </div>
                                <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="p-4 bg-white border-t">
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-gray-600">Add topics for {worker?.name} (separate with commas):</p>
                                                    <textarea value={manualTopicInput} onChange={(e) => setManualTopicInput(e.target.value)} placeholder="e.g., JavaScript, React, Node.js" className="w-full p-3 border rounded-lg h-20 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" onClick={(e) => e.stopPropagation()} />
                                                    <div className="flex justify-end space-x-2"><button type="button" onClick={() => setEditingWorker(null)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">Cancel</button><button type="button" onClick={() => handleManualTopicSave(workerId)} className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">Save Topics</button></div>
                                                </div>
                                            ) : topics.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">{topics.map((topic, index) => (<span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full"><BookOpen size={12} className="mr-1" />{topic}</span>))}</div>
                                            ) : (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3"><p className="text-orange-700 text-sm">No topics found. Click "Add Topics" to add manually.</p></div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Component ---
function GenerateQuestions() {
    const [topics, setTopics] = useState([]);
    const [currentTopic, setCurrentTopic] = useState('');
    const [workers, setWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [numQuestions, setNumQuestions] = useState(10);
    const [timeDuration, setTimeDuration] = useState('60');
    const [totalTestDuration, setTotalTestDuration] = useState('10');
    const [difficulty, setDifficulty] = useState('Medium');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [individualTopics, setIndividualTopics] = useState({});
    const [topicMode, setTopicMode] = useState('common');
    const [jobId, setJobId] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [generationProgress, setGenerationProgress] = useState({
        isGenerating: false,
        percentage: 0,
        result: null
    });
     const [jobContext, setJobContext] = useState({ totalWorkers: 0, totalQuestions: 0 });
    
    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true);
            try {
                const res = await api.get('/workers');
                setWorkers(res.data);
            } catch (err) {
                setError('Failed to load employees.');
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    useEffect(() => {
        if (!jobId || !isPolling) return;

        let intervalId;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/jobs/status/${jobId}`);
                if (!res.data) {
                    console.warn(`Job ${jobId} not found. Stopping polling.`);
                    setIsPolling(false);
                    clearInterval(intervalId);
                    return;
                }

                const { state, progress, reason, returnValue } = res.data;
                setGenerationProgress({ isGenerating: true, percentage: progress || 0, result: returnValue });

                if (state === 'completed' || state === 'failed') {
                    setIsPolling(false);
                    clearInterval(intervalId);
                    setJobId(null);
                    setGenerationProgress({ isGenerating: false, percentage: 100, result: returnValue });
                    
                    if (state === 'completed') {
                        const failedCount = returnValue?.failedWorkers?.length || 0;
                        if (failedCount > 0) {
                             const failedNames = returnValue.failedWorkers.map(fw => fw.workerName).join(', ');
                             setWarning(`Generation completed, but failed for: ${failedNames}.`);
                        } else {
                            setMessage('All questions generated successfully! Check the Question History page.');
                        }
                        setSelectedWorkers([]);
                        setTopics([]);
                        setIndividualTopics({});
                    } else {
                        setError(`Job failed: ${reason || 'An unknown error occurred.'}`);
                    }
                }
            } catch (err) {
                setError('Could not get job status. Please check the question history page manually.');
                setIsPolling(false);
                clearInterval(intervalId);
            }
        };

        checkStatus(); 
        intervalId = setInterval(checkStatus, 3000);

        return () => clearInterval(intervalId);
    }, [jobId, isPolling]);

    const handleSelectWorkersChange = (newSelectedWorkers) => {
        setSelectedWorkers(newSelectedWorkers);
        setIndividualTopics({});
        setMessage(''); setError(''); setWarning('');
    };

    const handleAddTopic = () => {
        if (currentTopic.trim()) {
            const newTopics = currentTopic.split(',').map(t => t.trim()).filter(Boolean);
            setTopics(prev => [...new Set([...prev, ...newTopics])]);
            setCurrentTopic('');
        }
    };

    const handleRemoveTopic = (topicToRemove) => setTopics(topics.filter(topic => topic !== topicToRemove));

    const handleUpdateIndividualTopics = (workerId, newTopics) => {
        const processedTopics = [...new Set(newTopics.flatMap(t => t.split(',').map(s => s.trim()).filter(Boolean)))];
        setIndividualTopics(prev => ({ ...prev, [workerId]: processedTopics }));
        setMessage(`Topics updated for the selected employee.`);
    };

    const handleLoadIndividualTopics = async () => {
        if (selectedWorkers.length === 0) {
            setError('Please select at least one employee to load their topics.');
            return;
        }
        setLoadingTopics(true);
        setError(''); setMessage(''); setWarning('');
        try {
            const newIndividualTopics = {};
            const workersWithoutTopics = [];
            for (const workerId of selectedWorkers) {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                try {
                    const res = await api.get(`/topics/weekly/${workerId}?${params.toString()}`);
                    newIndividualTopics[workerId] = (res.data?.length > 0) ? res.data : [];
                    if (res.data?.length === 0) workersWithoutTopics.push(workerId);
                } catch (err) {
                    newIndividualTopics[workerId] = [];
                    workersWithoutTopics.push(workerId);
                }
            }
            setIndividualTopics(newIndividualTopics);
            setTopicMode('individual');
            if (workersWithoutTopics.length > 0) {
                const workerNames = workersWithoutTopics.map(id => workers.find(w => w._id === id)?.name || 'Unknown').join(', ');
                setWarning(<div><p className="font-semibold">{`${workersWithoutTopics.length} employee(s) have no topics:`}</p><p className="text-sm italic mb-2">{workerNames}</p><p>You can add topics for them manually below.</p></div>);
            } else {
                setMessage(`Loaded topics for ${selectedWorkers.length} employee(s).`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load individual topics.');
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleGenerateClick = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setWarning('');
        let finalTopics = [...topics];
        if (topicMode === 'common' && currentTopic.trim()) {
            finalTopics.push(...currentTopic.split(',').map(t => t.trim()).filter(Boolean));
        }
        const formData = {
            workerIds: selectedWorkers,
            numQuestions: parseInt(numQuestions),
            difficulty,
            timeDuration: parseInt(timeDuration),
            totalTestDuration: parseInt(totalTestDuration) * 60,
            topicMode,
            topic: [...new Set(finalTopics)].join(', '),
            individualTopics,
        };
         setJobContext({
            totalWorkers: selectedWorkers.length,
            totalQuestions: selectedWorkers.length * parseInt(numQuestions)
        });

        try {
            const res = await api.post('/questions/generate', formData);
            if (res.data.jobId) {
                setJobId(res.data.jobId);
                setIsPolling(true);
                setGenerationProgress({ isGenerating: true, percentage: 0, result: null });
                setMessage('Question generation process has been started...');
                setTopics([]);
                setCurrentTopic('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start generation job.');
        }
    };

    const renderTopicSection = () => {
        if (topicMode === 'common') {
            return (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><BookOpen className="mr-2 text-gray-500" size={16} />Enter Common Topic(s)</label>
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 relative"><input type="text" placeholder="e.g., JavaScript, Python (comma-separated)" value={currentTopic} onChange={(e) => setCurrentTopic(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())} className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                        <Button type="button" onClick={handleAddTopic} disabled={!currentTopic.trim()} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"><Plus size={18} className="mr-2" /> Add</Button>
                    </div>
                    {topics.length > 0 && (<div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4"><h4 className="font-semibold text-green-800 mb-3">Added Topics ({topics.length})</h4><div className="flex flex-wrap gap-2">{topics.map((topic, index) => (<span key={index} className="inline-flex items-center bg-green-200 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full"><BookOpen size={12} className="mr-2" />{topic}<button type="button" onClick={() => handleRemoveTopic(topic)} className="ml-2 text-green-600 hover:text-red-600 transition-colors"><X size={14} /></button></span>))}</div></div>)}
                </div>
            );
        }
        if (topicMode === 'individual') {
            return (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><h4 className="font-semibold text-blue-800 mb-3 flex items-center"><Calendar className="mr-2" size={18} />Load Topics from Database</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="block text-sm font-medium text-blue-700 mb-1">Start Date<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></label><label className="block text-sm font-medium text-blue-700 mb-1">End Date<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></label></div><Button type="button" onClick={handleLoadIndividualTopics} disabled={loadingTopics || selectedWorkers.length === 0} className="w-full mt-4 bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-lg font-medium flex items-center justify-center">{loadingTopics ? <><RefreshCw className="mr-3 animate-spin" size={20} /> Loading Topics...</> : <><Download className="mr-3" size={20} /> Load Individual Topics</>}</Button></div>
                    <IndividualEmployeeTopics workers={workers} individualTopics={individualTopics} selectedWorkers={selectedWorkers} onUpdateTopics={handleUpdateIndividualTopics} />
                </div>
            );
        }
        return null;
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="container mx-auto px-4 py-8">
                <ProgressIndicator progress={generationProgress} totalWorkers={jobContext.totalWorkers} totalQuestions={jobContext.totalQuestions}/>
                <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AI Question Generator</h1><p className="text-gray-600 text-lg">Create intelligent assessments for your employees with advanced AI</p></div>
                <AnimatePresence>{error && <Alert type="error" message={error} onClose={() => setError('')} />}</AnimatePresence>
                <AnimatePresence>{warning && <Alert type="warning" message={warning} onClose={() => setWarning('')} />}</AnimatePresence>
                <AnimatePresence>{message && <Alert type="success" message={message} onClose={() => setMessage('')} />}</AnimatePresence>
                <form onSubmit={handleGenerateClick} className="space-y-8">
                    <Card title="Step 1: Select Employees" icon={UserCheck}><EmployeeMultiSelect workers={workers} selectedWorkers={selectedWorkers} onSelectChange={handleSelectWorkersChange} error={error && selectedWorkers.length === 0} /></Card>
                    <Card title="Step 2: Configure Topics" icon={BookOpen} headerActions={<div className="flex items-center space-x-2"><button type="button" onClick={() => setTopicMode('common')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${topicMode === 'common' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Common Topic</button><button type="button" onClick={() => setTopicMode('individual')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${topicMode === 'individual' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Individual Topics</button></div>}>{renderTopicSection()}</Card>
                    <Card title="Step 3: Question Configuration" icon={Settings}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <div><label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Target className="mr-2 text-gray-500" size={16} />Questions Per Employee</label><input type="number" min="1" max="100" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" /><p className="text-xs text-gray-500 mt-1">Each employee gets {numQuestions} questions</p></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Zap className="mr-2 text-gray-500" size={16} />Difficulty Level</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Clock className="mr-2 text-gray-500" size={16} />Time per Question (sec)</label><input type="number" min="10" max="300" value={timeDuration} onChange={(e) => setTimeDuration(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" /></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Clock className="mr-2 text-gray-500" size={16} />Total Test Duration (min)</label><input type="number" min="1" max="120" value={totalTestDuration} onChange={(e) => setTotalTestDuration(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" /><p className="text-xs text-gray-500 mt-1">e.g., 10 for 10 minutes</p></div>
                       </div>
                    </Card>
                    <div className="flex justify-center">
                        <Button type="submit" disabled={loading || isPolling || selectedWorkers.length === 0} className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center">
                            {isPolling ? (<><RefreshCw className="mr-3 animate-spin" size={24} /> Generating...</>) : (<><Zap className="mr-3" size={24} /> Generate AI Questions</>)}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GenerateQuestions;