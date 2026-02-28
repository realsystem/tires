import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast Notification Component
 * Displays temporary success/error messages
 */
const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
};

export default Toast;
