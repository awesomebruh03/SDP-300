
"use client";
import React from 'react';
import { useApp } from '@/hooks/useApp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProjectSelector() {
  const { projects, activeProjectId, setActiveProjectId } = useApp();
  const availableProjects = projects.filter(p => !p.isDeleted);

  if (availableProjects.length === 0) {
    return <p className="text-sm text-muted-foreground">No projects yet. Create one!</p>;
  }
  
  return (
    <Select
      value={activeProjectId || ""}
      onValueChange={(value) => setActiveProjectId(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[180px] text-sm">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {/* <SelectItem value="all">All Projects</SelectItem> */}
        {availableProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
