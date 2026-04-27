// frontend/src/pages/worker/WorkerTestPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import QuestionDisplay from '../../components/worker/QuestionDisplay';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import useTestSession from '../../hooks/useTestSession';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';


          
// FIX: Moved the long, problematic base64 string into a variable to prevent syntax errors.
const logoBase64 ="data:image/jpeg;base64,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"
           
function WorkerTestPage() {
  const navigate = useNavigate();

  const {
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
  } = useTestSession(useParams().workerId);

  // --- STATE DECLARATIONS ---
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);
  const [totalTimeLeft, setTotalTimeLeft] = useState(null);
  const [testScore, setTestScore] = useState(null);
  const [testTotalQuestions, setTestTotalQuestions] = useState(null);
  const [showFinalScoreScreen, setShowFinalScoreScreen] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [isTestActive, setIsTestActive] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [gracefulExit, setGracefulExit] = useState(false);
  // --- REFS ---
  const handleSubmitTestRef = useRef();
  const handleRecordAnswerAndAdvanceRef = useRef();
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const selectedOptionRef = useRef(selectedOption);
  const answersRef = useRef(answers);
  const timeUpRef = useRef(timeUp);
  const warningCountRef = useRef(warningCount);

  // --- DERIVED VARIABLES ---
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestionsCount = questions.length;
  const questionNumberDisplay = currentQuestionIndex + 1;
  const timerDanger = localTimeLeft <= 5;
  const hasAnsweredCurrentQuestion = selectedOption !== null;
  const isTimerActive = localTimeLeft > 0;

  // --- HOOKS & LOGIC ---
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);
  useEffect(() => { selectedOptionRef.current = selectedOption; }, [selectedOption]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeUpRef.current = timeUp; }, [timeUp]);
  useEffect(() => { warningCountRef.current = warningCount; }, [warningCount]);

 const handleSubmitTest = useCallback(async () => {
  if (showFinalScoreScreen) return;
  if (!testAttemptId) return console.error('No testAttemptId');

  const finalAnswers = [...answersRef.current];
  const currQ = questionsRef.current[currentQuestionIndexRef.current];
  if (currQ && !finalAnswers.some(a => String(a.questionId) === String(currQ._id))) {
    finalAnswers.push({
      questionId: currQ._id,
      selectedOption: selectedOptionRef.current,
      isCorrect: selectedOptionRef.current === currQ.correctOption,
    });
  }

  setIsLoading(true);
 // New code for handleSubmitTest
try {
  // Set the flag to indicate an intentional exit from fullscreen
  if (document.fullscreenElement) {
      setGracefulExit(true); 
      await document.exitFullscreen();
  }
  const { data } = await api.post(`/tests/submit/${testAttemptId}`, { answers: finalAnswers });
  
  setTestScore(data.score);
  setTestTotalQuestions(data.totalQuestions);
  setShowFinalScoreScreen(true);
  setIsTestActive(false);

  // **The Fix:** Move setIsLoading(false) here so the loader disappears immediately.
  setIsLoading(false);

  setTimeout(() => {
    setTestStatus('completed');
    navigate('/scoreboard');
  }, 5000); 

} catch (err) {
  console.error('Failed to submit test:', err);
  setError(err.response?.data?.message || 'Submit failed');
  setTestStatus('error');
  setIsLoading(false);
}
}, [testAttemptId, navigate, setIsLoading, setError, setTestStatus, showFinalScoreScreen]);

  useEffect(() => { handleSubmitTestRef.current = handleSubmitTest; }, [handleSubmitTest]);

  const handleRecordAnswerAndAdvance = useCallback((selectedOpt) => {
    const idx = currentQuestionIndexRef.current;
    const qs = questionsRef.current;
    if (qs[idx]) {
      const isCorrect = selectedOpt === qs[idx].correctOption;
      setAnswers(prev => {
        if (prev.some(a => String(a.questionId) === String(qs[idx]._id))) return prev;
        return [...prev, { questionId: qs[idx]._id, selectedOption: selectedOpt, isCorrect }];
      });
    }

    if (idx >= qs.length - 1) {
      handleSubmitTestRef.current();
    } else {
      const next = idx + 1;
      setCurrentQuestionIndex(next);
      setLocalTimeLeft(durationPerQuestion);
      const newStart = new Date();
      setQuestionStartTime(newStart);
      updateTestProgress(next, newStart);
      setSelectedOption(null);
      setTimeUp(false);
    }
  }, [durationPerQuestion, updateTestProgress]);
  
  useEffect(() => { handleRecordAnswerAndAdvanceRef.current = handleRecordAnswerAndAdvance; }, [handleRecordAnswerAndAdvance]);

  const handleOptionSelectedAndAdvance = useCallback((optIndex) => {
    setSelectedOption(optIndex);
    setTimeUp(false);
    handleRecordAnswerAndAdvanceRef.current(optIndex);
  }, [handleRecordAnswerAndAdvanceRef]);

  useEffect(() => {
    if (isTestActive) {
      if (questionStartTime && durationPerQuestion !== null && questions.length > 0) {
        const elapsed = Math.floor((Date.now() - new Date(questionStartTime).getTime()) / 1000);
        const rem = durationPerQuestion - elapsed;
        if (rem <= 0) {
          if(!timeUpRef.current) {
            setTimeUp(true);
            handleRecordAnswerAndAdvanceRef.current(null);
          }
        } else setLocalTimeLeft(rem);
      }
      if (testStartTime && totalTestDuration !== null) {
        const totalElapsed = Math.floor((Date.now() - new Date(testStartTime).getTime()) / 1000);
        const totalRem = totalTestDuration - totalElapsed;
        if (totalRem <= 0) handleSubmitTestRef.current();
        else setTotalTimeLeft(totalRem);
      }
    }
  }, [isTestActive, questionStartTime, durationPerQuestion, questions, currentQuestionIndex, testStartTime, totalTestDuration]);
  
  useEffect(() => {
    let timer;
    if (localTimeLeft > 0 && isTestActive) {
      timer = setInterval(() => setLocalTimeLeft(prev => (prev - 1)), 1000);
    } else if (localTimeLeft === 0 && isTestActive && !timeUpRef.current) {
        setTimeUp(true);
        handleRecordAnswerAndAdvanceRef.current(null);
    }
    return () => clearInterval(timer);
  }, [localTimeLeft, isTestActive]);
  
  useEffect(() => {
    let totalTimer;
    if (totalTimeLeft > 0 && isTestActive) {
      totalTimer = setInterval(() => setTotalTimeLeft(prev => (prev - 1)), 1000);
    } else if (totalTimeLeft === 0 && isTestActive) {
        handleSubmitTestRef.current();
    }
    return () => clearInterval(totalTimer);
  }, [totalTimeLeft, isTestActive]);

  const handleStartTest = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsTestActive(true);
    }).catch(err => {
      alert(`Error enabling full-screen mode: ${err.message}. Please allow fullscreen access to start the test.`);
    });
  };

 useEffect(() => {
  const handleFocusLoss = () => {
      if (warningCountRef.current < 2) {
          setWarningCount(prev => prev + 1);
          // alert(`Warning ${warningCountRef.current + 1} of 2: If you leave the test window again, your test will be automatically submitted.`);
      } else {
          // alert("You have left the test window too many times. Your test is being submitted.");
          handleSubmitTestRef.current();
      }
  }
  
  const handleVisibilityChange = () => {
    if (isTestActive && document.hidden) {
      setIsTestActive(false);
      handleFocusLoss();
    }
  };
  const handleFullscreenChange = () => {
    // Only call handleFocusLoss if the exit wasn't intentional
    if (!document.fullscreenElement && isTestActive && !gracefulExit) { 
      setIsTestActive(false);
      handleFocusLoss();
    }
    // Reset the flag immediately after the check
    setGracefulExit(false); 
  };
  const handleContextMenu = (e) => e.preventDefault();
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        // alert("Copying and pasting is disabled during the test.");
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, [isTestActive, gracefulExit]); // Add gracefulExit to the dependency array

  // --- RENDER LOGIC ---
  if (isLoading) return <Loader />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;
  if (!isLoading && (testStatus === 'no-test' || questions.length === 0)) return <div className="min-h-screen flex items-center justify-center">No test is available for you at this moment.</div>;
  
  if (showFinalScoreScreen) {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-200">
            <div className="w-full max-w-lg bg-white text-center p-8 rounded-2xl shadow-2xl animate-pop">
                <FaCheckCircle className="text-green-500 text-6xl mb-5 mx-auto animate-pop" />
                <h2 className="text-3xl font-bold text-green-700 mb-2">Test Submitted!</h2>
                <p className="text-lg text-gray-700 mb-4">Your Score: <span className="font-extrabold text-indigo-700">{testScore}</span> / <span className="font-bold text-gray-600">{testTotalQuestions}</span></p>
                <p className="text-gray-500 mt-2">Thank you for your effort! 🎉</p>
                <p className="text-gray-500 mt-4 animate-pulse">Redirecting to scoreboard...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="test-container w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-emerald-200 px-2 py-6 relative">
      {!isTestActive ? (
        <div className="w-full max-w-lg bg-white text-center p-8 rounded-2xl shadow-2xl animate-pop">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {warningCount > 0 ? "Test Paused" : "Test is Ready"}
          </h2>
          <p className="text-gray-600 mb-6">
            This test must be completed in fullscreen. You have **{2 - warningCount} warnings** remaining. If you switch tabs or exit fullscreen again, your test will be **automatically submitted**.
          </p>
          <Button
            onClick={handleStartTest}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 text-lg font-semibold"
          >
            {warningCount > 0 ? 'Re-enter Fullscreen to Continue' : 'Enter Fullscreen and Start Test'}
          </Button>
        </div>
      ) : (
        <>
          <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-green-200 opacity-20 rounded-full blur-3xl animate-float1 -z-10"></div>
          <div className="absolute bottom-0 right-0 w-[270px] h-[270px] bg-emerald-300 opacity-20 rounded-full blur-3xl animate-float2 -z-10"></div>
          <div className="w-full max-w-lg bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-7 pt-0 flex flex-col items-center">
            <div className="w-full flex flex-col items-center py-4 mb-4 border-b border-green-100">
              <img src={logoBase64}
               alt="Daily Test Logo" className="w-14 h-14 mb-1 object-contain rounded-full bg-white shadow" />
              <h2 className="text-2xl font-extrabold text-indigo-800 mb-1 mt-1">Week Test</h2>
              <span className="text-gray-500 text-xs mt-0">Question {questionNumberDisplay} of {totalQuestionsCount}</span>
            </div>
            <div className="w-full flex items-center justify-between mb-5">
              <div className="flex-1 h-2 bg-green-50 rounded-full overflow-hidden mr-4">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(questionNumberDisplay / totalQuestionsCount) * 100}%` }}
                />
              </div>
              {totalTimeLeft !== null && (
                  <span className={`flex items-center font-bold px-3 py-1 rounded-xl shadow-sm text-sm transition-all mr-2 ${totalTimeLeft <= 60 ? 'bg-red-400 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
                      <FaClock className="mr-1.5" /> Total: {Math.floor(totalTimeLeft / 60).toString().padStart(2, '0')}:{ (totalTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
              )}
              <span className={`flex items-center font-bold px-3 py-1 rounded-xl shadow-sm text-sm transition-all ${timerDanger ? 'bg-red-400 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
                <FaClock className="mr-1.5" /> Q: {localTimeLeft}s
              </span>
            </div>
            
            <QuestionDisplay
              question={currentQuestion}
              onOptionSelect={handleOptionSelectedAndAdvance}
              selectedOption={selectedOption}
              answerSelectedForCurrentQuestion={hasAnsweredCurrentQuestion}
              timerActive={isTimerActive}
            />
            
            {timeUp && (
              <div className="absolute bottom-5 right-5 text-red-500 font-bold flex items-center bg-red-50 rounded-xl px-3 py-2 shadow animate-shake">
                <FaTimesCircle className="mr-2" /> Time's up!
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .animate-pop {
          animation: cardpop 0.46s cubic-bezier(.37,.93,.6,1.29);
        }
        @keyframes cardpop {
          0% { transform: scale(0.96) translateY(18px); opacity: 0.33;}
          100% { transform: none; opacity: 1; }
        }
        .animate-shake {
          animation: shake 0.52s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px);}
          20%, 80% { transform: translateX(3px);}
          30%, 50%, 70% { transform: translateX(-6px);}
          40%, 60% { transform: translateX(6px);}
        }
        .animate-float1 { animation: float1 8s infinite alternate; }
        .animate-float2 { animation: float2 11s infinite alternate; }
        @keyframes float1 { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
        @keyframes float2 { 0% { transform: translateY(0); } 100% { transform: translateY(-40px); } }
      `}</style>
    </div>
  );
}

export default WorkerTestPage;