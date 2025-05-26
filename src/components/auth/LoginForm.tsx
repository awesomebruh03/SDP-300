
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/hooks/useApp';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'; // Corrected import path
import { Mail, Lock } from 'lucide-react';
import { app } from '@/app/layout'; // Import the app instance
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password for UI, not actually used for auth logic
  const { } = useApp();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Login Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        toast({
            title: "Login Error",
            description: "Please enter a valid email address.",
            variant: "destructive",
        });
        return;
    }
 // Use Firebase Authentication for login
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User logged in:', user);
        // The AppProvider's onAuthStateChanged listener will handle setting the currentUser state
        router.push('/dashboard'); // Redirect to dashboard
      })
      .catch((error) => {
        toast({ title: 'Login Error', description: error.message, variant: 'destructive' });
      });
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Task Ticker Login</CardTitle>
        <CardDescription className="text-center">
          Enter your email to access your tasks.
          <br />
          (Password field is for demo purposes only)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            Login
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline">
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
