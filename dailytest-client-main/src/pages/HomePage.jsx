
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EmployeeSelfRegistrationModal from '../components/worker/EmployeeSelfRegistrationModal';
// Use your logo path


function HomePage() {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleRegistrationSuccess = (employeeData) => {
    console.log('Registration successful:', employeeData);
    // Could show a toast notification or redirect
    setTimeout(() => {
      setShowRegistrationModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Nav */}
      <header className="w-full">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <img src="data:image/jpeg;base64,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"
            alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-green-800  to-green-500 bg-clip-text text-transparent">Tech vaseegrah</span>
          </div>
          {/* (Optional: Add nav links here if you want in future) */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="flex flex-col items-center justify-center mt-10">
          {/* Center mark/logo (optional, can use a different/mini logo) */}
        
          <div className="text-xl text-gray-700 mb-2">
            <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent">Hi</span>
            , 
            <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent"> Wel</span>
            come
            <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent">!</span>
          </div>
          <h1 className="font-black text-5xl sm:text-6xl text-gray-900 leading-tight mb-4">
            Your{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Daily
            </span>
           <br />
            Dose of Learning and Growth
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl">
            Test <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent">smarter</span>, not <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent">harder</span>.
          </p>
          
          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => setShowRegistrationModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Register Here
            </button>
            <Link to="/worker/login">
              <button className="px-8 py-3 bg-white border-2 border-green-500 text-green-600 text-xl font-semibold rounded-full shadow-lg hover:bg-green-50 hover:scale-105 transition-all duration-200">
                Already Registered? Login
              </button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-7">
          <Link to="/admin/login" className="inline-block">
            <button className="px-7 py-2 text-base font-medium rounded-full bg-gray-100 text-green-700 border border-green-100 hover:bg-green-50 transition">
              Admin access
            </button>
          </Link>
          <Link to="/scoreboard" className="inline-block">
            <button className="px-7 py-2 text-base font-medium rounded-full bg-gray-100 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 transition">
              View rankings
            </button>
          </Link>
        </div>
        </div>
      </main>
      
      {/* Self-Registration Modal */}
      <EmployeeSelfRegistrationModal 
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
      />
      
      {/* No footer */}
      <style>{`
        body { background: #fff; }
      `}</style>
    </div>
  );
}

export default HomePage;
