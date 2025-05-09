
"use client";
import React from 'react';
import { useApp } from '@/hooks/useApp';
import type { Task } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_DISPLAY_NAMES, STATUS_DISPLAY_NAMES } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2 } from 'lucide-react';
import { TaskFormDialog } from './TaskFormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function ListView() {
  const { activeProjectId, getTasksByProjectId, projects, deleteTask } = useApp();
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (!activeProjectId || !activeProject) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <p className="text-xl text-muted-foreground">Please select or create a project to see tasks.</p>
      </div>
    );
  }

  const tasks = getTasksByProjectId(activeProjectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };
  
  const priorityVariant = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
  } as const;


  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">Tasks for {activeProject.name}</h2>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks in this project yet.</p>
      ) : (
        <Card className="shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Time Spent (min)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {STATUS_DISPLAY_NAMES[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant[task.priority]} className="capitalize">
                      {PRIORITY_DISPLAY_NAMES[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {task.timeSpent || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(task)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {taskToEdit && activeProjectId && (
        <TaskFormDialog
          isOpen={isTaskFormOpen}
          onOpenChange={(isOpen) => {
            setIsTaskFormOpen(isOpen);
            if (!isOpen) setTaskToEdit(null);
          }}
          taskToEdit={taskToEdit}
          projectId={activeProjectId}
        />
      )}
      {taskToDelete && (
        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          onOpenChange={setIsConfirmDeleteOpen}
          onConfirm={confirmDelete}
          title="Delete Task"
          description={`Are you sure you want to delete the task "${taskToDelete.title}"? This action cannot be undone locally.`}
        />
      )}
    </div>
  );
}

// Temporary Card component placeholder if not globally available or specific styling is needed.
// If Card from ui/card is already used, this can be removed.
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={`bg-card text-card-foreground border rounded-lg p-0 ${className}`} {...props}>
    {children}
  </div>
);
