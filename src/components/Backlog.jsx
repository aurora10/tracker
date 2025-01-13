import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GradientButton } from './ui/gradient-button';
import { GradientText } from './ui/gradient-text';
import { PlusIcon } from '@heroicons/react/24/solid';

function Backlog({ tasks, onAddTask }) {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText);
      setNewTaskText('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <GradientText
        colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
        className="text-2xl font-semibold mb-4"
      >
        Backlog Tasks
      </GradientText>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Add a new task"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
                    <GradientButton 
                      variant="variant"
                      onClick={handleAddTask}
                      className="flex items-center justify-center min-w-[132px] px-4 py-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </GradientButton>
      </div>
      <SortableContext id="backlog-tasks" items={tasks} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <SortableItem key={`backlog-${task.id}`} id={`backlog-${task.id}`}>
              <li className="group bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-gray-700">{task.text}</span>
              </li>
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </div>
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

export default Backlog;
