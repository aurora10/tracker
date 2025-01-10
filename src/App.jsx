import React, { useState, useEffect } from 'react';
import Task from './components/Task';
import Backlog from './components/Backlog';
import { PlusIcon } from '@heroicons/react/24/solid';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Droppable from './components/Droppable';
import { arrayMove } from '@dnd-kit/sortable';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        status: 'pending',
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const handleTaskUpdate = (taskId, newStatus) => {
    if (newStatus === 'delete') {
      setTasks(tasks.filter(task => task.id !== taskId));
    } else {
      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: newStatus };
          if (newStatus === 'incomplete') {
            updatedTask.timer = {
              ...task.timer,
              remainingTime: task.timer.initialTime,
              isRunning: false
            };
          }
          return updatedTask;
        }
        return task;
      });
      setTasks(updatedTasks);
    }
  };

  const createPomodoroTaskFromBacklog = (movedItem) => ({
    ...movedItem,
    status: 'pending',
    id: Date.now(),
    timer: {
      initialTime: 60,
      remainingTime: 60,
      isRunning: false
    }
  });

  const reorderTasks = (items, activeId, overId) => {
    const oldIndex = items.findIndex(task => task.id === activeId);
    const newIndex = items.findIndex(task => task.id === overId);
    return arrayMove(items, oldIndex, newIndex);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    const activeId = active.id.toString();
    const overId = over?.id?.toString();

    // Handle moving from backlog to pomodoro
    if (activeId.startsWith('backlog-') && (!over || overId === 'pomodoro')) {
      const backlogItemIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === activeId);
      if (backlogItemIndex !== -1) {
        const movedItem = backlogTasks[backlogItemIndex];
        const newBacklogTasks = backlogTasks.filter((_, index) => index !== backlogItemIndex);
        const newTask = createPomodoroTaskFromBacklog(movedItem);
        setTasks([...tasks, newTask]);
        setBacklogTasks(newBacklogTasks);
      }
      return;
    }

    if (!over || active.id === over.id || !overId) {
      return;
    }

    // Handle reordering within backlog
    if (activeId.startsWith('backlog-') && overId.startsWith('backlog-')) {
      setBacklogTasks(reorderTasks(backlogTasks, activeId, overId));
      return;
    }

    // Handle reordering within pomodoro
    if (activeId.startsWith('pomodoro-') && overId.startsWith('pomodoro-')) {
      setTasks(reorderTasks(tasks, activeId, overId));
      return;
    }

    // Handle moving from backlog to specific pomodoro task
    if (activeId.startsWith('backlog-') && overId.startsWith('pomodoro-')) {
      const backlogItemIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === activeId);
      if (backlogItemIndex !== -1) {
        const movedItem = backlogTasks[backlogItemIndex];
        const newBacklogTasks = backlogTasks.filter((_, index) => index !== backlogItemIndex);
        const newTask = createPomodoroTaskFromBacklog(movedItem);
        
        // Find the target position in pomodoro list
        const targetIndex = tasks.findIndex(task => `pomodoro-${task.id}` === overId);
        const newTasks = [...tasks];
        newTasks.splice(targetIndex, 0, newTask);
        
        setTasks(newTasks);
        setBacklogTasks(newBacklogTasks);
      }
      return;
    }

    // Handle moving from pomodoro to backlog
    if (activeId.startsWith('pomodoro-') && overId.startsWith('backlog-')) {
      const pomodoroItemIndex = tasks.findIndex(task => `pomodoro-${task.id}` === activeId);
      if (pomodoroItemIndex !== -1) {
        const movedItem = tasks[pomodoroItemIndex];
        const newTasks = tasks.filter((_, index) => index !== pomodoroItemIndex);
        
        // Find the target position in backlog
        const backlogItemIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === overId);
        const newBacklogTasks = [...backlogTasks];
        newBacklogTasks.splice(backlogItemIndex, 0, { 
          ...movedItem, 
          id: Date.now(),
          status: 'backlog'
        });
        
        setBacklogTasks(newBacklogTasks);
        setTasks(newTasks);
      }
      return;
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  }

  return (
    <DndContext 
      onDragEnd={handleDragEnd} 
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            <div className="w-1/2 bg-white rounded-xl shadow-lg p-6">
              <Backlog 
                tasks={backlogTasks}
                onAddTask={(text) => {
                  const newTask = {
                    id: Date.now(),
                    text: text,
                  };
                  setBacklogTasks([...backlogTasks, newTask]);
                }}
              />
            </div>
            
            <div className="w-1/2 bg-white rounded-xl shadow-lg p-6">
              <Droppable id="pomodoro">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Pomodoro To-Do</h1>
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Add a new task"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <button 
                      onClick={handleAddTask} 
                      className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <Task key={task.id} task={task} onTaskUpdate={handleTaskUpdate} />
                    ))}
                  </div>
                </div>
              </Droppable>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">{activeId.split('-')[1]}</div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;
