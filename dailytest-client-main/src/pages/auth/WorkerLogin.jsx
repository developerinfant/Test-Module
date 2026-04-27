// frontend/src/pages/auth/WorkerLogin.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaSpinner, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

function WorkerLogin() {
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const res = await api.get('/workers');
        setWorkers(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load worker profiles.');
      } finally {
        setLoadingWorkers(false);
      }
    };
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    return (
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.workerId && worker.workerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
    setModalOpen(true);
    setPassword('');
    setShowPassword(false);
    setError('');
    setShake(false);
  };

  const handleWorkerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShake(false);
    try {
      const res = await api.post('/auth/worker/login', {
        workerId: selectedWorker.workerId,
        password,
      });

      login(res.data);
      
      setLoading(false);
      setModalOpen(false);
      setSelectedWorker(null);
      setPassword('');
      setShowPassword(false);
      
      navigate(`/worker`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid password.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedWorker(null);
    setPassword('');
    setShowPassword(false);
    setError('');
    setShake(false);
  };

  return (
    <StyledBG>
      {/* Animated gradient blobs */}
      <div className="bgblob1" />
      <div className="bgblob2" />
      <div className="main-container">
        <img
          src="data:image/jpeg;base64,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"
          alt="Logo"
          className="logo"
        />
        <h1 className="title">employee Login</h1>
        <div className="searchbar-glass">
          <FaLock className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {loadingWorkers ? (
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Loading employee profiles...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FaExclamationCircle />
            <p>{error}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="no-workers">
            <p>No employees found.</p>
          </div>
        ) : (
          <div className="workers-grid">
            {filteredWorkers.map((worker) => (
              <button
                className="worker-card"
                key={worker._id}
                onClick={() => handleWorkerClick(worker)}
                tabIndex={0}
              >
                <div className="worker-name">{worker.name}</div>
                <div className="worker-id">ID: {worker.workerId}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedWorker && (
        <div className="modal-overlay" tabIndex={-1} onClick={handleClose}>
          <form
            className={`modal-glass ${shake ? 'shake' : ''}`}
            tabIndex={0}
            autoComplete="off"
            onClick={e => e.stopPropagation()}
            onSubmit={handleWorkerLogin}
          >
            <div className="modal-title">
              <span className="modal-name">{selectedWorker.name}</span>
              <span className="modal-id">ID: {selectedWorker.workerId}</span>
            </div>
            <div className="modal-field">
              <label htmlFor="password" className="modal-label">Password</label>
              <div className="modal-password-row">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="modal-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="modal-eye"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {error && (
              <div className="modal-error">
                <FaExclamationCircle style={{ marginRight: 7 }} />
                {error}
              </div>
            )}
            <button type="submit" className="modal-login-btn" disabled={loading}>
              {loading && <FaSpinner className="modal-spinner" />} Log In
            </button>
            <button type="button" className="modal-cancel-btn" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </StyledBG>
  );
}

export default WorkerLogin;

const StyledBG = styled.div`
  min-height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 45%, #6ee7b7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
  .bgblob1, .bgblob2 {
    position: absolute;
    pointer-events: none;
    z-index: 0;
  }
  .bgblob1 {
    top: -200px; left: -200px;
    width: 540px; height: 540px;
    background: #a7f3d0;
    opacity: 0.19;
    border-radius: 50%;
    filter: blur(120px);
    animation: floatblob1 9s infinite alternate;
  }
  .bgblob2 {
    right: -170px; bottom: -170px;
    width: 480px; height: 480px;
    background: #6ee7b7;
    opacity: 0.22;
    border-radius: 50%;
    filter: blur(140px);
    animation: floatblob2 11s infinite alternate;
  }
  @keyframes floatblob1 {
    0% { transform: translateY(0);}
    100% { transform: translateY(50px);}
  }
  @keyframes floatblob2 {
    0% { transform: translateY(0);}
    100% { transform: translateY(-50px);}
  }
  .main-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 490px;
    margin: 0 auto;
    padding: 54px 18px 42px 18px;
    border-radius: 2.4rem;
    background: rgba(255,255,255,0.86);
    box-shadow: 0 4px 36px 0 rgba(16,185,129,0.10), 0 1.5px 10px 0 rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .logo {
    width: 74px; height: 74px; margin-bottom: 0.8rem;
    object-fit: contain;
    border-radius: 50%;
    box-shadow: 0 0 28px #10b981aa;
    background: #fff;
    border: 2px solid #fff;
  }
  .title {
    font-size: 2.1rem;
    font-weight: 800;
    letter-spacing: 0.01em;
    color: #232851;
    margin-bottom: 2.1rem;
    text-align: center;
  }
  .title-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  }
  .title-section .logo {
    width: 74px;
    height: 74px;
    object-fit: contain;
    margin-bottom: 8px;
  }
  .title-section h1 {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #222d3b;
    margin-bottom: 0;
  }
  .searchbar-glass {
    width: 100%;
    max-width: 340px;
    display: flex;
    align-items: center;
    background: rgba(240,245,255,0.87);
    border-radius: 1.2em;
    box-shadow: 0 1.5px 6px 0 rgba(16,185,129,0.10);
    padding: 0.18em 0.7em 0.18em 0.9em;
    margin-bottom: 2.3rem;
    border: 1.2px solid #d1d5db;
    transition: box-shadow 0.21s;
  }
  .searchbar-glass:focus-within {
    box-shadow: 0 2.5px 10px 0 #a7f3d033, 0 1.5px 10px 0 #10b98111;
  }
  .search-icon {
    color: #7886b2;
    font-size: 1.25em;
    margin-right: 0.72em;
    opacity: 0.7;
  }
  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1.13rem;
    font-family: inherit;
    color: #212e48;
    padding: 0.5em 0;
  }
  .loading-container, .error-container, .no-workers {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: #232851;
  }
  .loading-spinner {
    font-size: 2rem;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
    color: #10b981;
  }
  @keyframes spin {
    to { transform: rotate(360deg);}
  }
  .error-container {
    color: #dc2626;
    background: rgba(254, 226, 226, 0.5);
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 1rem 0;
  }
  .error-container svg {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .workers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 22px;
    width: 100%;
    max-width: 400px;
  }
  @media (min-width: 640px) {
    .workers-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 540px;
      gap: 26px;
    }
    .main-container { padding: 60px 32px 44px 32px;}
  }
  @media (min-width: 900px) {
    .workers-grid {
      grid-template-columns: repeat(4, 1fr);
      max-width: 760px;
      gap: 32px;
    }
    .main-container { max-width: 700px; }
  }
  .worker-card {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 100px;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    outline: none;
    will-change: transform;
    position: relative;
    color: #4b5563;
    
  }
  .worker-card:focus,
  .worker-card:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    transform: translateY(-4px) scale(1.02);
    border-color: #10b981;
  }
  .worker-name {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
    word-break: break-word;
  }
  .worker-id {
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.3em;
  }
  .dept-badge {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    margin-top: 0.5em;
    letter-spacing: 0.01em;
    background: #e5e7eb;
    color: #4b5563;
  }
  /* Modal Styles */
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(52,63,105,0.23);
    z-index: 40;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(2.5px);
    animation: modalfadein 0.17s;
  }
  @keyframes modalfadein { from { opacity: 0; } to { opacity: 1; } }
  .modal-glass {
    background: rgba(255,255,255,0.95);
    border-radius: 1.8rem;
    padding: 2.5em 2.3em 2.2em 2.3em;
    min-width: 300px;
    box-shadow: 0 2.5px 32px 0 #10b98133, 0 1.5px 10px 0 #05966918;
    max-width: 94vw;
    width: 340px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: modalpop 0.39s cubic-bezier(.39, .71, .56, 1.39);
  }
  @keyframes modalpop {
    0% { transform: scale(0.97) translateY(18px); opacity: 0.35;}
    100% { transform: none; opacity: 1; }
  }
  .shake {
    animation: shake 0.54s cubic-bezier(.36,.07,.19,.97) both;
  }
  @keyframes shake {
    10%, 90% { transform: translateX(-2px);}
    20%, 80% { transform: translateX(3px);}
    30%, 50%, 70% { transform: translateX(-6px);}
    40%, 60% { transform: translateX(6px);}
  }
  .modal-title {
    font-size: 1.22rem;
    font-weight: 700;
    margin-bottom: 0.21em;
    color: #232851;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    gap: 0.4em;
  }
  .modal-name {
    font-weight: 700;
    color: #232851;
    font-size: 1.15em;
    word-break: break-word;
    margin-bottom: 0.12em;
  }
  .modal-id {
    font-size: 0.9em;
    font-weight: 500;
    color: #666;
    margin-bottom: 0.2em;
  }
  .modal-dept {
    font-size: 1em;
    font-weight: 600;
    border-radius: 2em;
    padding: 0.21em 0.8em;
    letter-spacing: 0.01em;
    margin-bottom: 0.3em;
  }
  .modal-field {
    width: 100%;
    margin: 2.3em 0 0.88em 0;
  }
  .modal-label {
    font-size: 1.02em;
    font-weight: 500;
    color: #232851;
    margin-bottom: 0.61em;
    display: block;
  }
  .modal-password-row {
    position: relative; display: flex; align-items: center;
  }
  .modal-input {
    width: 100%;
    padding: 0.8em 2.7em 0.8em 0.9em;
    font-size: 1.12em;
    background: rgba(230,238,255,0.6);
    border: 1.6px solid #c7d6f9;
    border-radius: 0.98em;
    color: #232851;
    outline: none;
    font-weight: 500;
    transition: border 0.19s;
    box-shadow: 0 1px 3px #a5b4fc09;
  }
  .modal-input:focus {
    border: 1.6px solid #10b981;
    background: #fff;
  }
  .modal-eye {
    position: absolute; right: 0.7em; top: 50%; transform: translateY(-50%);
    background: none; border: none; outline: none;
    color: #7886b2; font-size: 1.18em; cursor: pointer; z-index: 10;
    transition: color 0.2s;
  }
  .modal-eye:hover { color: #059669; }
  .modal-error {
    width: 100%;
    color: #dc2626;
    background: #fee2e2;
    border-radius: 0.8em;
    padding: 0.56em 0.8em;
    font-size: 1em;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-bottom: 0.9em;
    margin-top: 0.28em;
    border: 1px solid #fecaca;
  }
  .modal-login-btn {
    width: 100%;
    margin-top: 0.31em;
    background: linear-gradient(90deg, #10b981 10%, #059669 100%);
    color: #fff;
    font-size: 1.13em;
    font-weight: 700;
    padding: 0.83em 0;
    border-radius: 0.91em;
    border: none;
    margin-bottom: 0.9em;
    cursor: pointer;
    box-shadow: 0 2px 8px #10b98125;
    display: flex; align-items: center; justify-content: center; gap: 0.7em;
    transition: background 0.19s, box-shadow 0.21s, transform 0.16s;
  }
  .modal-login-btn:active {
    transform: scale(0.98);
  }
  .modal-login-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  .modal-spinner {
    font-size: 1.1em;
    animation: spin 0.88s linear infinite;
  }
  .modal-cancel-btn {
    width: 100%;
    background: #f3f4f6;
    color: #7886b2;
    font-size: 1.1em;
    font-weight: 700;
    padding: 0.74em 0;
    border-radius: 0.87em;
    border: none;
    cursor: pointer;
    box-shadow: 0 1.5px 6px #c7d6f924;
    margin-top: 0.07em;
    transition: background 0.17s, color 0.13s, transform 0.15s;
  }
  .modal-cancel-btn:hover { background: #e0e7ef; color: #059669;}
`;