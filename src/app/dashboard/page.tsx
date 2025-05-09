
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/useApp';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Loader2 }  from 'lucide-react';


export default function DashboardPage() {
  const { isAuthenticated, currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
     if (currentUser === undefined) { // Still loading from AppProvider
      return;
    }
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  if (currentUser === undefined || !isAuthenticated) { // Show loader or redirect
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-grow overflow-hidden"> {/* Ensure main content area can scroll if KanbanBoard itself is too large */}
         <KanbanBoard />
      </main>
    </div>
  );
}
