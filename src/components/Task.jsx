import React, { useState, useEffect } from 'react';
    import { CheckCircleIcon, PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
    import useSound from 'use-sound';
    import alarmSound from '../assets/alarm.mp3';

    const Task = ({ task, onTaskUpdate }) => {
      const [isTimerRunning, setIsTimerRunning] = useState(false);
      const [timeRemaining, setTimeRemaining] = useState(1 * 60);
      const [play] = useSound(alarmSound);
      const [showModal, setShowModal] = useState(false);

      useEffect(() => {
        let intervalId;
        if (isTimerRunning && timeRemaining > 0) {
          intervalId = setInterval(() => {
            setTimeRemaining((prevTime) => prevTime - 1);
          }, 1000);
        } else if (timeRemaining === 0) {
          setIsTimerRunning(false);
          play();
          setShowModal(true);
        }
        return () => clearInterval(intervalId);
      }, [isTimerRunning, timeRemaining, task, onTaskUpdate, play]);

      const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      const handleStartPause = () => {
        setIsTimerRunning(!isTimerRunning);
      };

      const handleReset = () => {
        setIsTimerRunning(false);
        setTimeRemaining(1 * 60);
      };

      const handleComplete = (isCompleted) => {
        onTaskUpdate(task.id, isCompleted ? 'completed' : 'partial');
        setShowModal(false);
        setTimeRemaining(1 * 60);
      };

      return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center mb-2 sm:mb-0">
            {task.status === 'completed' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            ) : task.status === 'partial' ? (
              <ArrowPathIcon className="h-5 w-5 text-yellow-500 mr-2" />
            ) : null}
            <span className={`mr-2 text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
            {isTimerRunning && (
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs ml-2">Doing</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="mr-4">{formatTime(timeRemaining)}</span>
            <button onClick={handleStartPause} className="mr-2">
              {isTimerRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button onClick={handleReset}>
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
              <div className="bg-white p-5 rounded">
                <p className="mb-4">Task "{task.text}" completed?</p>
                <div className="flex justify-end">
                  <button onClick={() => handleComplete(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">Yes</button>
                  <button onClick={() => handleComplete(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">No</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default Task;
