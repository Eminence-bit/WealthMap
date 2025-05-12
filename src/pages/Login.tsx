
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { OnboardingForm } from '../components/OnboardingForm';

export default function Login() {
  const { isSignedIn, isLoaded } = useUser();
  
  // If user is already signed in, redirect to map
  if (isLoaded && isSignedIn) {
    return <Navigate to="/map" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingForm />
    </div>
  );
}
