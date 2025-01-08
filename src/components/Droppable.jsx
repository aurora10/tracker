import React from 'react';
import {useDroppable} from '@dnd-kit/core';

function Droppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: props.id,
  });
  
  const style = {
    minHeight: '200px',
    border: isOver ? '2px dashed #4ade80' : '2px dashed transparent',
    borderRadius: '0.5rem',
    padding: isOver ? '1rem' : '1rem',
    transition: 'all 0.2s ease',
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      {props.children || (
        <div className="text-gray-400 text-center py-4">
          Drop tasks here
        </div>
      )}
    </div>
  );
}

export default Droppable;
