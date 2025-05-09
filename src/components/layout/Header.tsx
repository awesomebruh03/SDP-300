
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/useApp';
import { ProjectSelector } from '@/components/projects/ProjectSelector';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { PlusCircle, LogOut, UserCircle, FolderPlus } from 'lucide-react';

export function Header() {
  const { currentUser, logout, isAuthenticated, activeProjectId } = useApp();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          TaskTicker
        </Link>
        
        {isAuthenticated && currentUser && (
          <div className="flex items-center gap-4">
            <ProjectSelector />
            
            <Button variant="outline" size="sm" onClick={() => setIsProjectFormOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" /> New Project
            </Button>
            <ProjectFormDialog isOpen={isProjectFormOpen} onOpenChange={setIsProjectFormOpen} />

            {activeProjectId && (
              <>
                <Button variant="default" size="sm" onClick={() => setIsTaskFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
                <TaskFormDialog 
                  isOpen={isTaskFormOpen} 
                  onOpenChange={setIsTaskFormOpen} 
                  projectId={activeProjectId} 
                />
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated && currentUser ? (
            <>
              <span className="text-sm text-foreground flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                {currentUser.email}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
