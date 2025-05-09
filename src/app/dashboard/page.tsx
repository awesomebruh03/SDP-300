
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/useApp';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraphView } from '@/components/tasks/GraphView';
import { ListView } from '@/components/tasks/ListView'; // Import ListView

export default function DashboardPage() {
  const { isAuthenticated, currentUser, activeProjectId } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Initialize loading to true

  useEffect(() => {
    // currentUser can be null for logged out, or User object for logged in, or undefined if still loading
    if (currentUser === undefined) { 
      // Still waiting for AppProvider to determine auth state from localStorage
      return;
    }
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setLoading(false); // Auth state determined and user is authenticated
    }
  }, [isAuthenticated, currentUser, router]);

  if (loading) { // Show loader if loading or if redirecting (currentUser will be null before redirect)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If authenticated user, but loading might still be true if activeProjectId is loading
  // This check ensures we only render content once everything is settled.
  if (!currentUser && !isAuthenticated) {
    // This case should ideally be caught by the useEffect redirect,
    // but as a fallback, show loader.
     return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-grow overflow-hidden bg-background"> {/* Ensure main has bg for consistency */}
        <Tabs defaultValue="kanban" className="h-full flex flex-col">
          <div className="p-4 border-b"> {/* Added padding and border to TabsList container */}
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto"> {/* Centered and constrained width */}
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="graph">Graph View</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="flex-grow overflow-y-auto">
             {activeProjectId ? <ListView /> : <NoProjectSelectedMessage />}
          </TabsContent>
          <TabsContent value="kanban" className="flex-grow overflow-hidden"> {/* Kanban needs overflow hidden if it handles its own scroll */}
            {activeProjectId ? <KanbanBoard /> : <NoProjectSelectedMessage />}
          </TabsContent>
          <TabsContent value="graph" className="flex-grow overflow-y-auto">
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
