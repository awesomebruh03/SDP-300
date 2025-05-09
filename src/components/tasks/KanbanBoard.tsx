
"use client";
import React from 'react';
import { useApp } from '@/hooks/useApp';
import { KanbanColumn } from './KanbanColumn';
import { TASK_STATUSES } from '@/lib/constants';
import type { TaskStatus } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


export function KanbanBoard() {
  const { activeProjectId, getTasksByProjectIdAndStatus, moveTask } = useApp();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault(); // Necessary to allow dropping
    // Optionally, add visual feedback here
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const tasksInNewColumn = getTasksByProjectIdAndStatus(activeProjectId, newStatus);
    
    // Simple drop logic: append to the end of the column or determine position
    // For more precise positioning, you'd need to analyze e.clientY relative to task cards
    let newOrder = tasksInNewColumn.length;

    // More advanced drop positioning (experimental)
    const columnElement = e.currentTarget; // The column div
    const dropY = e.clientY;
    
    const cards = Array.from(columnElement.querySelectorAll('[id^="task-"]')) as HTMLElement[];
    let targetIndex = cards.length; // Default to end

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


    moveTask(taskId, newStatus, newOrder, activeProjectId || undefined);
  };
  
  if (!activeProjectId) {
     return (
      <div className="flex-grow flex items-center justify-center p-6">
        <p className="text-xl text-muted-foreground">Please select or create a project to see tasks.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 h-[calc(100vh-4rem-1.5rem)]"> {/* Adjust height based on header */}
      <ScrollArea className="h-full w-full whitespace-nowrap">
        <div className="flex gap-6 pb-4 h-full">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={getTasksByProjectIdAndStatus(activeProjectId, status)}
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
