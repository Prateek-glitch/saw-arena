import React from 'react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-gradient-to-br from-gray-800 to-gray-900 
        rounded-2xl shadow-2xl border border-gray-600 
        max-w-md w-full mx-4 p-6 transform transition-all duration-300
        ${className}
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;