import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function Backlog({ tasks, onAddTask }) {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText);
      setNewTaskText('');
    }
  };


  return (
    <div className="backlog">
      <h2>Backlog</h2>
      <div className="flex mb-4">
        <input
          type="text"
          className="border p-2 mr-2 flex-1"
          placeholder="Add a new task"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <button onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add
        </button>
      </div>
        <SortableContext id="backlog-tasks" items={tasks} strategy={verticalListSortingStrategy}>
            <ul>
                {tasks.map((task, index) => (
                    <SortableItem key={`backlog-${task.id}`} id={`backlog-${task.id}`}>
                        <li className="bg-gray-100 p-2 mb-2 rounded">
                            {task.text}
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
