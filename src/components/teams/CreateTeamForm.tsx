// src/components/teams/CreateTeamForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Input } from '@/components/ui/input'; // Assuming you have an Input component
import { Label } from '@/components/ui/label'; // Assuming you have a Label component

export function CreateTeamForm() {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      console.log('Creating team with name:', teamName.trim());
      // Here you would typically call a function to create the team
      // and then potentially close the form or navigate.
      setTeamName(''); // Clear the input after logging
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name</Label>
        <Input
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
          required
        />
      </div>
      <Button type="submit">Create Team</Button>
    </form>
  );
}