// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './hooks/useAuth.jsx'; // <-- Import AuthProvider

function App() {
    return (
        <Router>
            <AuthProvider> {/* <-- Wrap AppRoutes with AuthProvider */}
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;