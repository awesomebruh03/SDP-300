
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/useApp';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraphView } from '@/components/tasks/GraphView';
import { ListView } from '@/components/tasks/ListView'; 

export default function DashboardPage() {
  const { isAuthenticated, currentUser, activeProjectId } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true); 

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
             {activeProjectId ? <ListView /> : <NoProjectSelectedMessage />}
          </TabsContent>
          <TabsContent value="kanban" className="flex-grow overflow-hidden">
            {activeProjectId ? <KanbanBoard /> : <NoProjectSelectedMessage />}
          </TabsContent>
          <TabsContent value="graph" className="flex-grow"> {/* Adjusted for ReactFlow full space */}
            {activeProjectId ? <GraphView /> : <NoProjectSelectedMessage />}
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
