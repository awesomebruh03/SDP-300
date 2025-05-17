import React from 'react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    // Add other project properties you want to display
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold">{project.name}</h3>
      {/* Add more project details here */}
    </div>
  );
};

export default ProjectCard;