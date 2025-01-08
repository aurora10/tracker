import React from 'react';

export default function Modal({ isOpen, onConfirm, onCancel, taskText }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Timer Complete</h2>
        <p className="mb-4">Did you complete "{taskText}"?</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Yes
          </button>
          <button 
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
