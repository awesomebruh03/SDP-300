
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/useApp';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, currentUser } = useApp(); // currentUser access triggers context load
  const router = useRouter();

  useEffect(() => {
    // Wait for currentUser to be determined by AppProvider from localStorage
    if (currentUser === undefined) { 
      return; // Still loading auth state
    }

    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
