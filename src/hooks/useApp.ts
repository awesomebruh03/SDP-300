
"use client";
import { useContext } from 'react';
import { AppContext, type AppContextType } from '@/contexts/AppProvider';

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
