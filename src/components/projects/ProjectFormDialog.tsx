
"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import type { Project, ProjectFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectToEdit?: Project;
}

export function ProjectFormDialog({ isOpen, onOpenChange, projectToEdit }: ProjectFormDialogProps) {
  const { addProject, updateProject } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Error", description: "Project name is required.", variant: "destructive" });
      return;
    }

    const projectData: ProjectFormData = { name, description };

    try {
      if (projectToEdit) {
        updateProject(projectToEdit.id, projectData);
        toast({ title: "Project Updated", description: `Project "${name}" has been updated.` });
      } else {
        addProject(projectData);
        toast({ title: "Project Created", description: `Project "${name}" has been created.` });
      }
      onOpenChange(false); // Close dialog
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{projectToEdit ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {projectToEdit ? 'Update the details of your project.' : 'Fill in the details for your new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional: A brief description of the project."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{projectToEdit ? 'Save Changes' : 'Create Project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
