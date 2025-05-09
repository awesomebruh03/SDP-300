
"use client";
import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {PRIORITY_DISPLAY_NAMES, STATUS_DISPLAY_NAMES} from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Edit3, Trash2, GripVertical, Clock } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { TaskFormDialog } from './TaskFormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'; // Assuming this will be created

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const { deleteTask, activeProjectId } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const priorityVariant = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
  } as const;
  
  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <>
      <Card 
        className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-grab active:cursor-grabbing bg-card"
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        id={`task-${task.id}`}
      >
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight">{task.title}</CardTitle>
          <GripVertical className="h-5 w-5 text-muted-foreground self-center cursor-grab"/>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {task.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
          <div className="flex flex-wrap gap-2 items-center text-xs mb-2">
            <Badge variant={priorityVariant[task.priority]}>
              {PRIORITY_DISPLAY_NAMES[task.priority]} Priority
            </Badge>
            {task.dueDate && (
              <div className="flex items-center text-muted-foreground">
                <CalendarDays className="h-3 w-3 mr-1" />
                <span>{format(parseISO(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
             {typeof task.timeSpent === 'number' && task.timeSpent > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{task.timeSpent} min</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditOpen(true)}>
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit Task</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setIsConfirmDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Task</span>
          </Button>
        </CardFooter>
      </Card>
      {activeProjectId && 
        <TaskFormDialog 
          isOpen={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          taskToEdit={task}
          projectId={task.projectId || activeProjectId}
        />
      }
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone locally.`}
      />
    </>
  );
}
