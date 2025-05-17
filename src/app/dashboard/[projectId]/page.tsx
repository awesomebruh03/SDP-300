// src/app/dashboard/[projectId]/page.tsx
'use client';

import React, { useMemo, useEffect, useState, use } from 'react'; // Import 'use'
import { useApp } from '@/hooks/useApp';
import { notFound } from 'next/navigation';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
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
const ProjectDashboardPage: React.FC<ProjectDashboardPageProps> = ({ params }) => {
  const { projectId } = use(Promise.resolve(params)); // Unwrap params with use()
  // Assuming useApp provides arrays of Project and Task objects
  const { projects, tasks, setActiveProjectId } = useApp();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false); // State for TaskFormDialog

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

  return (
 <div className="flex h-screen flex-col">
 {/* Header for the project dashboard */}
 <header className="p-4 border-b flex justify-between items-center"> {/* Added flex justify-between items-center back */}
 <h1 className="text-2xl font-bold">{project.name}</h1>
 </header>

 <main className="flex-grow overflow-hidden bg-background">
 {/* Tabs for switching between task views */}
 <Tabs defaultValue="kanban" className="h-full flex flex-col">
 <div className="p-4 border-b">
 {/* Ensure TabsList and Triggers match your UI component library */}
 <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
 <TabsTrigger value="list">List View</TabsTrigger>
 <TabsTrigger value="kanban">Kanban</TabsTrigger>
 <TabsTrigger value="graph">Graph View</TabsTrigger>
 </TabsList>
 </div>

 {/* Content for each tab */}
 <TabsContent value="list" className="flex-grow overflow-y-auto">
 {/* Pass setIsTaskFormOpen and projectId to ListView if needed for task creation from list view */}
 <ListView tasks={projectTasks} setIsTaskFormOpen={setIsTaskFormOpen} />
 </TabsContent>
 <TabsContent value="kanban" className="flex-grow overflow-hidden">
 {/* Pass setIsTaskFormOpen and projectId to KanbanBoard */}
 <KanbanBoard tasks={projectTasks} setIsTaskFormOpen={setIsTaskFormOpen} projectId={projectId} />
 </TabsContent>
 <TabsContent value="graph" className="flex-grow">
 {/* Pass setIsTaskFormOpen and projectId to GraphView if needed */}
 <GraphView tasks={projectTasks} />
 </TabsContent>
 </Tabs>
 </main>
 {/* Task Form Dialog */}

 {/* Floating Action Button for Add Task */}
 <Button
 variant="default"
 size="lg"
 className="fixed bottom-8 right-8 rounded-full shadow-lg z-50 w-16 h-16 p-0 text-3xl flex items-center justify-center"
 title="Create Task"
 onClick={() => setIsTaskFormOpen(true)}
 aria-label="Create Task"
 >
 <PlusCircle className="w-8 h-8" /> {/* Assuming PlusCircle is imported */}
 </Button>

 <TaskFormDialog isOpen={isTaskFormOpen} onOpenChange={setIsTaskFormOpen} projectId={projectId} />
 </div>
  );

};

export default ProjectDashboardPage;
