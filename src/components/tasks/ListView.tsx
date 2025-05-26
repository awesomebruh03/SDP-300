
"use client";
import React from 'react';
import { useApp } from '@/hooks/useApp';
import type { Task, Milestone } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_DISPLAY_NAMES, STATUS_DISPLAY_NAMES } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { TaskFormDialog } from './TaskFormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card } from '@/components/ui/card';

export function ListView({ setIsTaskFormOpen: setParentTaskFormOpen }: { setIsTaskFormOpen: (isOpen: boolean) => void }) {
  // Use the passed down setIsTaskFormOpen prop
  const setIsTaskFormOpenState = setParentTaskFormOpen;
  const { 
    activeProjectId, 
    getTasksByProjectId, 
    projects, 
    deleteTask,
    getMilestonesByProjectId 
  } = useApp();
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null);
  // isTaskFormOpen state is now managed by the parent component
  // const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
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

  // Group tasks by milestone
  const allTasks = getTasksByProjectId(activeProjectId);
  const milestoneGroups: Record<string, Task[]> = {}; // milestoneId => Task[]
  const noMilestone: Task[] = [];
  
  allTasks.forEach((task) => {
    if (task.milestoneId) {
      if (!milestoneGroups[task.milestoneId]) milestoneGroups[task.milestoneId] = [];
      milestoneGroups[task.milestoneId].push(task);
    } else {
      noMilestone.push(task);
    }
  });

  // Get sorted milestones for the active project
  const sortedMilestones = getMilestonesByProjectId(activeProjectId);

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpenState(true);
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
    <div className="relative p-6 h-full overflow-y-auto space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Tasks for {activeProject.name}</h2>
      
      {allTasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks in this project yet.</p>
      ) : (
        // Render milestone groups
        [...sortedMilestones, { id: "", name: "No Milestone" } as Milestone].map((milestone) => {
          const tasks = milestone.id ? milestoneGroups[milestone.id] || [] : noMilestone;
          if (tasks.length === 0) return null;
          
          return (
            <div key={milestone.id || "no-milestone"} className="mb-8">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <Badge variant="secondary" className="mr-2">{milestone.name}</Badge>
                <span className="text-xs text-muted-foreground font-normal">({tasks.length} tasks)</span>
              </h3>
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
            </div>
          );
        })
      )}

      {taskToEdit && activeProjectId && (
        <TaskFormDialog
          // Pass the state from the parent if the parent manages it
          // For the edit dialog within ListView, we manage its state locally
          isOpen={!!taskToEdit} // Open dialog if taskToEdit is not null
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