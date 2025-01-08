import React, { useState, useEffect } from 'react';
import Task from './components/Task';
import Backlog from './components/Backlog';
import { PlusIcon } from '@heroicons/react/24/solid';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Droppable from './components/Droppable';
import { arrayMove, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [backlogTasks, setBacklogTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);


  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
  };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        const activeId = active.id.toString();
        const overId = over?.id?.toString();

        // If dropping into empty Pomodoro section
        if (activeId.startsWith('backlog-') && (!over || overId === 'pomodoro')) {
            const backlogItemIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === activeId);
            const movedItem = backlogTasks[backlogItemIndex];
            const newBacklogTasks = backlogTasks.filter((_, index) => index !== backlogItemIndex);
            const newTask = {
              ...movedItem,
              status: 'pending',
              id: Date.now(),
              timer: {
                initialTime: 60, // 1 minute in seconds
                remainingTime: 60,
                isRunning: false
              }
            };
            setTasks([...tasks, newTask]);
            setBacklogTasks(newBacklogTasks);
            return;
        }

        if (!over || active.id === over.id) {
            return;
        }

        if (activeId.startsWith('backlog-') && overId.startsWith('backlog-')) {
            const oldIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === activeId);
            const newIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === overId);
            setBacklogTasks(arrayMove(backlogTasks, oldIndex, newIndex));
        } else if (activeId.startsWith('pomodoro-') && overId.startsWith('pomodoro-')) {
            const oldIndex = tasks.findIndex(task => `pomodoro-${task.id}` === activeId);
            const newIndex = tasks.findIndex(task => `pomodoro-${task.id}` === overId);
            setTasks(arrayMove(tasks, oldIndex, newIndex));
        } else if (activeId.startsWith('backlog-') && overId.startsWith('pomodoro-')) {
            const backlogItemIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === activeId);
            const movedItem = backlogTasks[backlogItemIndex];
            const newBacklogTasks = backlogTasks.filter((_, index) => index !== backlogItemIndex);
            const newTask = {...movedItem, status: 'pending', id: Date.now()};
            setTasks([...tasks, newTask]);
            setBacklogTasks(newBacklogTasks);
        } else if (activeId.startsWith('pomodoro-') && overId.startsWith('backlog-')) {
            const pomodoroItemIndex = tasks.findIndex(task => `pomodoro-${task.id}` === activeId);
            const movedItem = tasks[pomodoroItemIndex];
            const newTasks = tasks.filter((_, index) => index !== pomodoroItemIndex);
            const backlogItemIndex = backlogTasks.findIndex(task => `backlog-${task.id}` === overId);
            const newBacklogTasks = [...backlogTasks];
            newBacklogTasks.splice(backlogItemIndex, 0, {...movedItem, id: Date.now()});
            setBacklogTasks(newBacklogTasks);
            setTasks(newTasks);
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
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="container mx-auto p-4 flex flex-col">
        <div className="flex border p-4 mb-4">
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
        <div className="flex border p-4">
          <Droppable id="pomodoro">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">Pomodoro To-Do</h1>
              <div className="flex mb-4">
              <input
                type="text"
                className="border p-2 mr-2 flex-1"
                placeholder="Add a new task"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
              />
              <button onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                <PlusIcon className="h-5 w-5 inline-block align-middle" />
              </button>
            </div>
              <div className="bg-white shadow rounded">
                {tasks.map((task) => (
                  <Task key={task.id} task={task} onTaskUpdate={handleTaskUpdate} />
                ))}
              </div>
            </div>
          </Droppable>
        </div>
        <DragOverlay>
              {activeId ? (
                  <div className="bg-gray-100 p-2 mb-2 rounded">{activeId.split('-')[1]}</div>
              ) : null}
          </DragOverlay>
      </div>
    </DndContext>
  );
}

function SortableItem(props) {
    const {attributes, listeners, setNodeRef, transform} = useSortable({id: props.id});
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {props.children}
        </div>
    )
}

    export default App;
