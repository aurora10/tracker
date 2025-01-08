import React, { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { arrayMove, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function NewPage() {
  const [items1, setItems1] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [items2, setItems2] = useState(['Item A', 'Item B', 'Item C']);
    const [activeId, setActiveId] = useState(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;
      setActiveId(null);

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId.startsWith('list1-') && overId.startsWith('list1-')) {
        const oldIndex = items1.findIndex(item => `list1-${item}` === activeId);
        const newIndex = items1.findIndex(item => `list1-${item}` === overId);
        setItems1(arrayMove(items1, oldIndex, newIndex));
    } else if (activeId.startsWith('list2-') && overId.startsWith('list2-')) {
        const oldIndex = items2.findIndex(item => `list2-${item}` === activeId);
        const newIndex = items2.findIndex(item => `list2-${item}` === overId);
        setItems2(arrayMove(items2, oldIndex, newIndex));
    } else if (activeId.startsWith('list1-') && overId.startsWith('list2-')) {
        const itemIndex = items1.findIndex(item => `list1-${item}` === activeId);
        const movedItem = items1[itemIndex];
        const newItems1 = items1.filter((_, index) => index !== itemIndex);
        const overItemIndex = items2.findIndex(item => `list2-${item}` === overId);
        const newItems2 = [...items2];
        newItems2.splice(overItemIndex, 0, movedItem);
        setItems1(newItems1);
        setItems2(newItems2);
    } else if (activeId.startsWith('list2-') && overId.startsWith('list1-')) {
        const itemIndex = items2.findIndex(item => `list2-${item}` === activeId);
        const movedItem = items2[itemIndex];
        const newItems2 = items2.filter((_, index) => index !== itemIndex);
        const overItemIndex = items1.findIndex(item => `list1-${item}` === overId);
        const newItems1 = [...items1];
        newItems1.splice(overItemIndex, 0, movedItem);
        setItems1(newItems1);
        setItems2(newItems2);
    }
  };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="flex">
        <div className="w-1/2 p-4">
          <h2>List 1</h2>
          <SortableContext id="list1" items={items1} strategy={verticalListSortingStrategy}>
            <ul>
              {items1.map((item, index) => (
                <SortableItem key={`list1-${item}`} id={`list1-${item}`}>
                  <div className="bg-gray-100 p-2 mb-2 rounded">{item}</div>
                </SortableItem>
              ))}
            </ul>
          </SortableContext>
        </div>
        <div className="w-1/2 p-4">
          <h2>List 2</h2>
          <SortableContext id="list2" items={items2} strategy={verticalListSortingStrategy}>
            <ul>
              {items2.map((item, index) => (
                 <SortableItem key={`list2-${item}`} id={`list2-${item}`}>
                  <div className="bg-gray-100 p-2 mb-2 rounded">{item}</div>
                </SortableItem>
              ))}
            </ul>
          </SortableContext>
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

export default NewPage;
