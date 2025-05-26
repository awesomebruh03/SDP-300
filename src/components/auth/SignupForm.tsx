'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { app } from '@/app/layout';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SignupForm: React.FC = () => {
  const { toast } = useToast(); // Get the toast function
  const router = useRouter(); // Get the router instance
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Signup logic will be added here later
    if (password !== confirmPassword) {
      toast({
        title: 'Signup Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log('User signed up:', user);
        toast({
          title: 'Signup Successful',
          description: 'Your account has been created.',
        });
        router.push('/dashboard'); // Redirect to dashboard
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error('Signup error:', errorMessage);
        toast({
          title: 'Signup Error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Task Ticker Signup</CardTitle>
        <CardDescription className="text-center">
          Create your account to get started.
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
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10"
                autoComplete="new-password" // Suggest a new password for confirmation field
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            Sign Up
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
