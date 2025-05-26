"use client";

import React from 'react';
import SignupForm from '@/components/auth/SignupForm'; // Import SignupForm

const SignupPage = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignupForm /> {/* Render SignupForm */}
    </div>
  );
};

export default SignupPage;