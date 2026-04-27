// frontend/src/layouts/AuthLayout.jsx
import React from 'react';

function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800">
            {children}
        </div>
    );
}

export default AuthLayout;