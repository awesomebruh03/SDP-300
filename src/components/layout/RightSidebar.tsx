'use client';

import React, { ReactNode, useState } from 'react';
import { X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext'; // Import the hook
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { TeamList } from '@/components/teams/TeamList'; // Import TeamList
import { CreateTeamForm } from '@/components/teams/CreateTeamForm'; // Import CreateTeamForm

interface RightSidebarProps {
}
type SidebarView = 'list' | 'create';

export function RightSidebar({ children }: RightSidebarProps) {
  const { isOpen, toggleSidebar } = useSidebar(); // Consume the context

  return (
    <>
      {/* Overlay */}
      {/* Added a simple overlay for better UX when sidebar is open */}
      {/* This overlay will also close the sidebar when clicked */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      {/* Use transform and transition for the sliding animation */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Teams</h2>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto"> {/* Added height and overflow */}
          {/* Content based on currentView */}
          <TeamList />

          {/* Placeholder content - can be replaced */}
          <div className="mt-4">
            {/* Add buttons to switch between views */}
            <Button variant="outline" className="w-full mb-2">
              View Teams
            </Button>
            <Button className="w-full">
              Create Team
            </Button>
          </div>

          {/* Content Placeholder */}
          {children}
        </div>
      </div>
    </>
  );
}