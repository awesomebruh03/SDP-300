// src/app/projects/page.tsx
'use client';

import React from 'react';
import ProjectCard from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import Link from 'next/link'; // Import Link
import { useApp } from '@/hooks/useApp'; // Import the useApp hook

const ProjectsPage: React.FC = () => {
  const { projects } = useApp(); // Get projects from the useApp context

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Button>Create Project</Button> {/* Using a Button component */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty state */}
        {projects.length === 0 ? (
          <div>No projects found. Create a new project to get started.</div>
        ) : (
          projects.map((project) => (
            <Link key={project.id} href={`/dashboard/${project.id}`}>
              <ProjectCard project={project} />
            </Link>
 ))
        )}
      </div>
    </div>
  );
};
export default ProjectsPage;
