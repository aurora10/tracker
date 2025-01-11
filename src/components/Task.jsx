import React, { useReducer, useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, CheckIcon, CircleStackIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Modal from './Modal';
import alarmSound from '../assets/alarm.mp3';

function Task({ task, onTaskUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [initialTime, setInitialTime] = useState(task.timer?.remainingTime || 1500);
  const [remainingTime, setRemainingTime] = useState(task.timer?.remainingTime || 1500);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setRemainingTime(timeLeft);
        if (timeLeft === 0) {
          setIsRunning(false);
          setShowModal(true);
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRunning, endTime]);

  const startTimer = () => {
    const now = Date.now();
    setEndTime(now + remainingTime * 1000);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingTime(initialTime);
  };

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(alarmSound);
    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (remainingTime === 0 && !isRunning) {
      setShowModal(true);
      audioRef.current.play();
    }
  }, [remainingTime, isRunning]);

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
      <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            {isRunning && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                In Progress
              </span>
            )}
            {!isRunning && task.status === 'incomplete' && (
              <CircleStackIcon className="h-5 w-5 text-blue-500" />
            )}
            {task.status === 'completed' && (
              <CheckIcon className="h-5 w-5 text-green-500" />
            )}
            <span className={`text-sm sm:text-base flex-1 ${
              task.status === 'completed' ? 'line-through text-green-600' : 'text-gray-700'
            }`}>
              {task.text}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {task.status === 'completed' && (
              <button
                onClick={() => onTaskUpdate(task.id, 'delete')}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-700">
                {formatTime(remainingTime)}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    if (isRunning) {
                      stopTimer();
                    } else {
                      startTimer();
                    }
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {isRunning ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    setInitialTime(task.timer?.initialTime || 1500);
                    resetTimer();
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
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
