
"use client";
import React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { STATUS_DISPLAY_NAMES } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onDragStart, onDragOver, onDrop }: KanbanColumnProps) {
  const statusColors: Record<TaskStatus, string> = {
    todo: 'border-t-sky-500',
    'in-progress': 'border-t-amber-500',
    done: 'border-t-green-500',
    'on-hold': 'border-t-slate-500',
  };

  return (
    <div
      className={`flex-1 min-w-[300px] max-w-[380px] h-full bg-secondary/50 rounded-lg shadow-md flex flex-col border-t-4 ${statusColors[status]}`}
      onDragOver={(e) => onDragOver(e, status)}
      onDrop={(e) => onDrop(e, status)}
      data-status-column={status}
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          {STATUS_DISPLAY_NAMES[status]}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({tasks.length})</span>
        </h3>
      </div>
      <ScrollArea className="flex-grow p-4">
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground italic">
            No tasks here yet.
          </div>
        )}
        {tasks.map((task, index) => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
        ))}
        {/* Placeholder for drop indication */}
        <div className="min-h-[1px]" data-drop-placeholder></div> 
      </ScrollArea>
    </div>
  );
}
