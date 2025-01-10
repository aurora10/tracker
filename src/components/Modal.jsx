import React from 'react';

export default function Modal({ isOpen, onConfirm, onCancel, taskText }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all duration-200 ease-out scale-95 opacity-0 animate-modal-in">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Timer Complete</h2>
          <p className="text-gray-600 mb-6">
            Did you complete <span className="font-medium">"{taskText}"</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              No
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
