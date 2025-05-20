
"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/hooks/useApp';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraphView } from '@/components/tasks/GraphView';
import { ListView } from '@/components/tasks/ListView'; 
import { Task } from '@/lib/types'; // Assuming a Task type definition

export default function DashboardPage() {
  const { isAuthenticated, currentUser, activeProjectId, getTasksByProjectId } = useApp(); // Destructure getTasksByProjectId
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]); // State to hold tasks
  const [tasksLoading, setTasksLoading] = useState(false); // State to indicate if tasks are loading

  useEffect(() => {
    if (currentUser === undefined) { 
      return;
    }
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setLoading(false); 
    }
  }, [isAuthenticated, currentUser, router]);

  // Fetch tasks when activeProjectId changes
  useEffect(() => {
    if (activeProjectId) {
      // Use getTasksByProjectId from context
      const projectTasks = getTasksByProjectId(activeProjectId);
      setTasks(projectTasks);
    } else {
      setTasks([]); // Clear tasks when no project is selected
    }
  }, [activeProjectId]);

  if (loading) { 
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser && !isAuthenticated) {
     return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="flex h-screen flex-col">
      <Header />
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
             {activeProjectId ? <ListView tasks={tasks} /> : <NoProjectSelectedMessage />}
          </TabsContent>
          <TabsContent value="kanban" className="flex-grow overflow-hidden">
            {activeProjectId ? <KanbanBoard tasks={tasks} /> : <NoProjectSelectedMessage />}
          </TabsContent>
          <TabsContent value="graph" className="flex-grow"> {/* Adjusted for ReactFlow full space */}
            {activeProjectId ? <GraphView tasks={tasks} /> : <NoProjectSelectedMessage />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const NoProjectSelectedMessage = () => (
  <div className="flex-grow flex items-center justify-center p-6 h-full">
    <p className="text-xl text-muted-foreground">Please select or create a project to see tasks.</p>
  </div>
);
