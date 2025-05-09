
"use client";
import React from 'react';
import { useApp } from '@/hooks/useApp';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';

export function GraphView() {
  const { activeProjectId, getTasksByProjectId, projects } = useApp();

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (!activeProjectId || !activeProject) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <p className="text-xl text-muted-foreground">Please select or create a project to view its graph.</p>
      </div>
    );
  }

  const tasks = getTasksByProjectId(activeProjectId);

  return (
    <div className="p-6 h-full overflow-auto flex flex-col items-center space-y-8">
      <Card className="w-full max-w-md shadow-xl bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{activeProject.name} (Project)</CardTitle>
        </CardHeader>
      </Card>

      {tasks.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <ArrowDown className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {tasks.map((task) => (
              <Card key={task.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description || "No description"}
                  </p>
                  <div className="mt-2 text-xs">
                    <span className="font-semibold">Status:</span> {task.status} <br />
                    <span className="font-semibold">Priority:</span> {task.priority}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-muted-foreground mt-4">This project has no tasks.</p>
      )}
    </div>
  );
}
