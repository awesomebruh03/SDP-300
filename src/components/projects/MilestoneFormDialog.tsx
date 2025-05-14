"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useApp } from "@/hooks/useApp";
import type { Milestone, MilestoneFormData, Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface MilestoneFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  milestoneToEdit?: Milestone;
  projectId: string;
  projects: Project[];
}

export function MilestoneFormDialog({
  isOpen,
  onOpenChange,
  milestoneToEdit,
  projectId,
  projects,
}: MilestoneFormDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedProjectId, setAssignedProjectId] = useState(projectId);

  // You will need to add these actions to your AppContext for a complete workflow
  // For now, this shows the UI pattern.
  const { addMilestone, updateMilestone } = useApp() as any;

  useEffect(() => {
    setAssignedProjectId(projectId);
    if (milestoneToEdit) {
      setName(milestoneToEdit.name);
      setDescription(milestoneToEdit.description || "");
      setAssignedProjectId(milestoneToEdit.projectId);
    } else {
      setName("");
      setDescription("");
      setAssignedProjectId(projectId);
    }
  }, [milestoneToEdit, isOpen, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedProjectId) {
      toast({
        title: "Error",
        description: "Milestone must be assigned to a project.",
        variant: "destructive",
      });
      return;
    }
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Milestone name is required.",
        variant: "destructive",
      });
      return;
    }

    const milestoneData: MilestoneFormData = {
      name,
      description,
      projectId: assignedProjectId,
    };

    try {
      if (milestoneToEdit) {
        updateMilestone(milestoneToEdit.id, milestoneData);
        toast({
          title: "Milestone Updated",
          description: `Milestone "${name}" has been updated.`,
        });
      } else {
        addMilestone(milestoneData);
        toast({
          title: "Milestone Created",
          description: `Milestone "${name}" has been created.`,
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const availableProjects = projects.filter((p) => !p.isDeleted);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {milestoneToEdit ? "Edit Milestone" : "Create Milestone"}
          </DialogTitle>
          <DialogDescription>
            {milestoneToEdit
              ? "Update the details of your milestone."
              : "Add a new milestone to this project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* If you want to allow cross-project milestone assignment */}
          {availableProjects.length > 1 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectId" className="text-right">
                Project
              </Label>
              <select
                id="projectId"
                value={assignedProjectId}
                onChange={(e) => setAssignedProjectId(e.target.value)}
                className="col-span-3 px-2 py-1 border rounded"
                required
              >
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4 mt-4">
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
          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional: describe this milestone..."
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {milestoneToEdit ? "Save Changes" : "Create Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}