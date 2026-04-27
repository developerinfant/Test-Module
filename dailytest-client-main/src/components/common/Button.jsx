// frontend/src/components/common/Button.jsx
import React from 'react';

function Button({ children, onClick, type = 'button', disabled = false, className }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`py-2 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
        >
            {children}
        </button>
    );
}

export default Button;