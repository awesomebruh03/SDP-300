import React from 'react';

interface Team {
  id: string;
  name: string;
}

const mockTeams: Team[] = [
  { id: '1', name: 'Team Alpha' },
  { id: '2', name: 'Team Beta' },
  { id: '3', name: 'Team Gamma' },
];

export function TeamList() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Teams</h2>
      {mockTeams.length > 0 ? (
        <ul>
          {mockTeams.map((team) => (
            <li key={team.id} className="border-b border-gray-200 py-2">
              {team.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>You are not currently in any teams.</p>
      )}
    </div>
  );
}