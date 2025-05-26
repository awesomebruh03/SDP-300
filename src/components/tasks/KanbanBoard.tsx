// src/components/tasks/KanbanBoard.tsx
'use client';
import React from 'react';
import { useApp } from '@/hooks/useApp';
import { KanbanColumn } from './KanbanColumn';
import { TASK_STATUSES } from '@/lib/constants';
import type { TaskStatus, Task } from '@/lib/types'; // Import Task type
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button'; // Import Button
import { PlusCircle } from 'lucide-react'; // Import PlusCircle icon


interface KanbanBoardProps {
  setIsTaskFormOpen: (isOpen: boolean) => void; // Accept setIsTaskFormOpen prop
  projectId: string; // Accept projectId prop
}

export function KanbanBoard({ setIsTaskFormOpen, projectId }: KanbanBoardProps) { // Destructure props
  const { tasks, moveTask, activeProjectId } = useApp(); // get tasks and moveTask from useApp


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    // Optionally, add visual feedback here
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Use the tasks prop for determining order within the current view
    const tasksInNewColumn = tasks
      .filter(task => task.status === newStatus)
      .sort((a, b) => a.order - b.order);

    let newOrder = tasksInNewColumn.length;

    const columnElement = e.currentTarget;
    const dropY = e.clientY;

    const cards = Array.from(columnElement.querySelectorAll('[id^="task-"]')) as HTMLElement[];
    let targetIndex = cards.length;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (dropY < midY) {
        targetIndex = i;
        break;
      }
    }
    newOrder = targetIndex;

    // Pass the projectId from props when moving a task
    moveTask(taskId, newStatus, newOrder, projectId);
  };


  return (
    <div className="flex-grow p-6 h-[calc(100vh-4rem-1.5rem)] relative">
      <ScrollArea className="h-full w-full whitespace-nowrap">
        <div className="flex gap-6 pb-4 h-full">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              // Filter the tasks prop by status and sort by order for each column
              tasks={tasks.filter(task => task.status === status).sort((a, b) => a.order - b.order)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
