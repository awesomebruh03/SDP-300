// src/app/dashboard/[projectId]/page.tsx
'use client';
// Removed 'useState' and 'use' imports as they are no longer needed in this way
import React, { useMemo, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import { notFound } from 'next/navigation';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { useSidebar } from '@/context/SidebarContext';
import { ListView } from '@/components/tasks/ListView';
import { GraphView } from '@/components/tasks/GraphView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'; // Assuming you have this
// Define the types for your project and task if you have them elsewhere
// import { Project, Task } from '@/types'; // Example import

interface ProjectDashboardPageProps {
  params: {
    projectId: string;
  };
}

// Assuming Project and Task types are defined in your useApp context or globally
// If not, you might need to define them here or import them.
// Example basic types if you don't have them:
// interface Project {
//   id: string;
//   name: string;
//   // ... other project properties
// }

// interface Task {
//   id: string;
//   projectId: string; // Link to the project
//   // ... other task properties (title, status, priority, etc.)
// }


import { PlusCircle } from 'lucide-react'; // Import PlusCircle
export default function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  // Access projectId directly from params
  const { projectId } = params;
  // Assuming useApp provides arrays of Project and Task objects
  const { projects, tasks, setActiveProjectId, createTask } = useApp(); // Assuming createTask is in useApp
  // Get state and close function from context
  const { isTaskFormOpen, closeTaskForm } = useSidebar(); // Get state and close function from context

  // Find the project with the matching ID
  const project = useMemo(() => {
    // Ensure projects is an array before using .find()
    if (!Array.isArray(projects)) {
        console.error("Projects is not an array in useApp context");
        return undefined;
    }
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  // If project is not found, show a 404 page
  if (!project) {
    // This will render Next.js's default not-found page
    notFound();
  }

  // Filter tasks based on projectId
  const projectTasks = useMemo(() => {
    // Ensure tasks is an array and task objects have a 'projectId' property
     if (!Array.isArray(tasks)) {
        console.error("Tasks is not an array in useApp context");
        return [];
    }
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks, projectId]);

  // Set the active project ID in the context when the component mounts
  useEffect(() => {
    setActiveProjectId(projectId);
    // Optional: Cleanup function to reset activeProjectId when leaving this page
    // This might be necessary depending on how you want the global activeProjectId
    // to behave when navigating away from a project-specific dashboard.
    // return () => setActiveProjectId(null);
  }, [projectId, setActiveProjectId]); // Added setActiveProjectId to dependency array

  // You might want to add loading states if fetching data is asynchronous
  // For now, assuming data is immediately available from context after initial load

  // Move console.log inside the component function body
  console.log('isTaskFormOpen:', isTaskFormOpen);
  // Add console.log immediately after getting the value from the hook
  console.log('isTaskFormOpen value from hook:', isTaskFormOpen);

  return (
    <div className="flex h-screen flex-col">
      {/* Assuming you have a Header component or similar for layout */}
      {/* <Header /> */} 
      <main className="flex-grow overflow-hidden bg-background">
        <Tabs defaultValue="kanban" className="h-full flex flex-col">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="graph">Graph View</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="flex-grow overflow-y-auto">
             <ListView tasks={projectTasks} />
          </TabsContent>
          <TabsContent value="kanban" className="flex-grow overflow-hidden">
            <KanbanBoard
 tasks={projectTasks}
 projectId={projectId}
 />
          </TabsContent>
          <TabsContent value="graph" className="flex-grow">
            <GraphView tasks={projectTasks} />
          </TabsContent>
        </Tabs>
      </main>
      {/* Assuming you have a TaskFormDialog or similar component here */}
      {/* {isTaskFormOpen && <TaskFormDialog onClose={closeTaskForm} />} */}
    </div>
  );
};