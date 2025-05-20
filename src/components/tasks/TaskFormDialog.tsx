

"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import type { Task, TaskFormData, Priority } from '@/lib/types';
import { PRIORITIES, PRIORITY_DISPLAY_NAMES, TASK_STATUSES, STATUS_DISPLAY_NAMES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  taskToEdit?: Task;
  projectId: string; // Always require projectId
  initialStatus?: Task['status'];
}

// Add assignedUserId to Task and TaskFormData types in '@/lib/types' if not already there
export function TaskFormDialog({ isOpen, onOpenChange, taskToEdit, projectId, initialStatus }: TaskFormDialogProps) {
  console.log('TaskFormDialog rendering, isOpen:', isOpen); // Add this line
  const { addTask, updateTask, projects, activeProjectId } = useApp();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Task['status']>(initialStatus || 'todo');
  const [assignedProjectId, setAssignedProjectId] = useState<string>(projectId || activeProjectId || '');
  const [timeSpent, setTimeSpent] = useState<number>(0); // in minutes

  useEffect(() => {
    setAssignedProjectId(projectId || activeProjectId || '');
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setAssignedProjectId(taskToEdit.projectId);
      setTimeSpent(taskToEdit.timeSpent || 0);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setPriority('medium');
      setTimeSpent(0);
    }
  }, [taskToEdit, isOpen, projectId, activeProjectId, initialStatus]); // Added assignedUserId to dependency array implicitly via taskToEdit

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Error", description: "Task title is required.", variant: "destructive" });
      return;
    }
    if (!assignedProjectId) {
      toast({ title: "Error", description: "Task must be assigned to a project.", variant: "destructive" });
      return;
    }

    const taskData: TaskFormData = {
      title,
      description,
      dueDate: dueDate?.toISOString(),
      priority,
      status,
      projectId: assignedProjectId,
      timeSpent,
    };
    
    try {
      if (taskToEdit) {
        updateTask(taskToEdit.id, taskData);
        toast({ title: "Task Updated", description: `Task "${title}" has been updated.` });
      } else {
        addTask(taskData);
        toast({ title: "Task Created", description: `Task "${title}" has been created.` });
      }
      onOpenChange(false); // Close dialog
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const availableProjects = projects.filter(p => !p.isDeleted);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {taskToEdit ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional: Add more details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="space-y-1">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p} value={p}>{PRIORITY_DISPLAY_NAMES[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_DISPLAY_NAMES[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project */}
              <div className="space-y-1">
                <Label htmlFor="project">Project</Label>
                <Select value={assignedProjectId} onValueChange={(value: string) => setAssignedProjectId(value)} required>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Spent */}
             <div className="space-y-1">
              <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
              <Input id="timeSpent" type="number" value={timeSpent} onChange={(e) => setTimeSpent(Math.max(0,parseInt(e.target.value) || 0))} />
            </div>

          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{taskToEdit ? 'Save Changes' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

