import React, { useState, useEffect } from 'react';
import { GradientButton } from './components/ui/gradient-button';
import { GradientText } from './components/ui/gradient-text';
import Task from './components/Task';
import Backlog from './components/Backlog';
import { PlusIcon } from '@heroicons/react/24/solid';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import Droppable from './components/Droppable';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from './lib/supabase';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else if (data) {
      setTasks(data.filter(t => t.type === 'pomodoro'));
      setBacklogTasks(data.filter(t => t.type === 'backlog'));
    }
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Syncing: change received from Supabase', payload);
          fetchTasks();
        }
      )
      .subscribe((status) => {
        console.log('Supabase Subscription Status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      console.log('Attempting to add task:', newTaskText);
      const newTask = {
        text: newTaskText,
        status: 'pending',
        type: 'pomodoro',
        timer: {
          initialTime: 1500,
          remainingTime: 1500,
          isRunning: false
        }
      };

      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (error) {
        console.error('Error adding task:', error);
        alert(`Failed to add task: ${error.message}`);
      } else {
        console.log('Task added successfully:', data);
        fetchTasks(); // Trigger manual refetch for immediate feedback
      }
      setNewTaskText('');
    }
  };

  const handleTaskUpdate = async (taskId, newStatus) => {
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    if (newStatus === 'delete') {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
        console.error('Error deleting task:', error);
      } else {
        fetchTasks();
      }
    } else {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      const updates = { status: newStatus };
      if (newStatus === 'incomplete') {
        updates.timer = {
          ...taskToUpdate.timer,
          remainingTime: taskToUpdate.timer.initialTime,
          isRunning: false
        };
      }

      const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
      if (error) {
        console.error('Error updating task:', error);
      } else {
        fetchTasks();
      }
    }
  };

  const handleAddBacklogTask = async (text) => {
    console.log('Adding backlog task:', text);
    const newTask = {
      text: text,
      type: 'backlog',
      status: 'pending'
    };
    const { error } = await supabase.from('tasks').insert([newTask]);
    if (error) {
      console.error('Error adding backlog task:', error);
      alert(`Failed to add backlog task: ${error.message}`);
    } else {
      fetchTasks();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    const activeIdStr = active.id.toString();
    const overIdStr = over?.id?.toString();

    // Extract database IDs from draggable IDs (e.g., "backlog-uuid" -> "uuid")
    const getDbId = (id) => id.substring(id.indexOf('-') + 1);

    // Handle moving from backlog to pomodoro
    if (activeIdStr.startsWith('backlog-') && (!over || overIdStr === 'pomodoro')) {
      const dbId = getDbId(activeIdStr);
      console.log(`Dragging from backlog to pomodoro: ID ${dbId}`);
      const { error } = await supabase
        .from('tasks')
        .update({
          type: 'pomodoro',
          timer: { initialTime: 1500, remainingTime: 1500, isRunning: false }
        })
        .eq('id', dbId);
      if (error) {
        console.error('Error moving task to pomodoro:', error);
      } else {
        fetchTasks();
      }
      return;
    }

    if (!over || active.id === over.id || !overIdStr) {
      return;
    }

    // Handle moving from backlog to specific pomodoro task (as a target)
    if (activeIdStr.startsWith('backlog-') && overIdStr.startsWith('pomodoro-')) {
      const dbId = getDbId(activeIdStr);
      console.log(`Dragging from backlog to pomodoro (target): ID ${dbId}`);
      const { error } = await supabase
        .from('tasks')
        .update({
          type: 'pomodoro',
          timer: { initialTime: 1500, remainingTime: 1500, isRunning: false }
        })
        .eq('id', dbId);
      if (error) {
        console.error('Error moving task to pomodoro:', error);
      } else {
        fetchTasks();
      }
      return;
    }

    // Handle moving from pomodoro to backlog
    if (activeIdStr.startsWith('pomodoro-') && overIdStr.startsWith('backlog-')) {
      const dbId = getDbId(activeIdStr);
      console.log(`Dragging from pomodoro to backlog: ID ${dbId}`);
      const { error } = await supabase
        .from('tasks')
        .update({ type: 'backlog' })
        .eq('id', dbId);
      if (error) {
        console.error('Error moving task to backlog:', error);
      } else {
        fetchTasks();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg2:flex-row gap-4 lg2:gap-8">
            <div className="w-full lg2:w-1/2 bg-white rounded-xl shadow-lg p-4 lg2:p-6">
              <Backlog
                tasks={backlogTasks}
                onAddTask={handleAddBacklogTask}
              />
            </div>

            <div className="w-full lg2:w-1/2 bg-white rounded-xl shadow-lg p-4 lg2:p-6 mt-4 lg2:mt-0">
              <Droppable id="pomodoro">
                <div>
                  <GradientText
                    colors={["#40aaff", "#ff40aa", "#40aaff"]}
                    className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6"
                  >
                    Pomodoro To-Do
                  </GradientText>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                    <input
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Add a new task"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <GradientButton
                      onClick={handleAddTask}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 mt-2 sm:mt-0"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </GradientButton>
                  </div>
                  <SortableContext id="pomodoro-tasks" items={tasks.map(t => `pomodoro-${t.id}`)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                      <Task key={task.id} task={task} onTaskUpdate={handleTaskUpdate} />
                    ))}
                  </SortableContext>
                </div>
              </Droppable>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              {tasks.find(t => `pomodoro-${t.id}` === activeId)?.text ||
                backlogTasks.find(t => `backlog-${t.id}` === activeId)?.text}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;
