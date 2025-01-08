import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Modal from './Modal';

function Task({ task, onTaskUpdate }) {
  const [time, setTime] = useState(task.timer?.remainingTime || 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (time === 0 && isRunning) {
      setShowModal(true);
      setIsRunning(false);
      clearInterval(intervalId);
    }
  }, [time, isRunning]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const id = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalId);
  };

  const resetTimer = () => {
    setTime(task.timer?.initialTime || 60);
    stopTimer();
  };

  const handleModalConfirm = () => {
    onTaskUpdate(task.id, 'completed');
    setShowModal(false);
  };

  const handleModalCancel = () => {
    onTaskUpdate(task.id, 'incomplete');
    setShowModal(false);
    resetTimer();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center mb-2 sm:mb-0">
          {isRunning && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
              Doing
            </span>
          )}
          {!isRunning && task.status === 'incomplete' && (
            <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className={`text-sm sm:text-base ${task.status === 'completed' ? 'line-through decoration-green-600' : ''}`}>
            {task.text}
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-4">{formatTime(time)}</span>
          <button 
            onClick={isRunning ? stopTimer : startTimer} 
            className="mr-2"
          >
            {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </button>
          <button onClick={resetTimer}>
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        taskText={task.text}
      />
    </>
  );
}

export default Task;
