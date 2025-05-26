'use client';

import { useSidebar } from '@/context/SidebarContext';
import { useApp } from '@/hooks/useApp'; // Import useApp to access setIsTaskFormOpen
import { RightSidebar } from '@/components/layout/RightSidebar'; // Adjust the import path if necessary
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react'; // Import icons for buttons

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggleSidebar, openTaskForm } = useSidebar();

  return (
    <>
      {/* Left Sidebar/Navigation could go here */}
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Buttons container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {/* Button to toggle the Right Sidebar (for team actions) */}
        <Button
          onClick={toggleSidebar}
          size="lg" // Make it a bit larger
          className="rounded-full shadow-lg w-16 h-16 p-0 flex items-center justify-center"
          title="Team Actions"
          aria-label="Toggle Team Sidebar"
        >
          <Users className="w-8 h-8" /> {/* Use Users icon for team */}
        </Button> {/* <--- CLOSING TAG WAS MISSING HERE */}
      </div>

      <RightSidebar />
    </>
  );
}