
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

export function TutorialModal() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(false);
  
  // Tutorial steps - will be customized based on user role
  const baseSteps: TutorialStep[] = [
    {
      title: 'Welcome to Wealth Map',
      description: 'Navigate the map with zoom and pan controls to explore properties in different areas.',
      image: '/tutorial-map.png',
    },
    {
      title: 'Property Details',
      description: 'Click on property markers to view detailed information including value, size, and wealth estimation.',
      image: '/tutorial-property.png',
    },
    {
      title: 'Search & Filter',
      description: 'Use the search bar to find properties by address, and apply filters to narrow down results by value, size, or ZIP code.',
      image: '/tutorial-search.png',
    },
    {
      title: 'Bookmarks',
      description: 'Save properties of interest by bookmarking them for quick access later from your profile.',
      image: '/tutorial-bookmarks.png',
    },
  ];
  
  const adminStep: TutorialStep = {
    title: 'Admin Features',
    description: 'As an admin, you have access to additional features including employee management and data analytics.',
    image: '/tutorial-admin.png',
  };
  
  // Check if this is the first login and if user is admin
  useEffect(() => {
    const checkFirstLogin = async () => {
      // Check if tutorial has been seen before via local storage
      const seen = localStorage.getItem('tutorial_seen');
      if (seen) {
        setTutorialSeen(true);
        return;
      }
      
      // If user is logged in, check their role
      if (user?.id) {
        try {
          const { data } = await supabase
            .from('permissions')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          setIsAdmin(data?.role === 'admin');
          setIsOpen(true);
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Fall back to regular tutorial if we can't determine role
          setIsOpen(true);
        }
      }
    };
    
    checkFirstLogin();
  }, [user?.id]);
  
  // Get the appropriate steps based on user role
  const steps = isAdmin ? [...baseSteps, adminStep] : baseSteps;
  
  // Handle navigation between steps
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On the last step
      handleClose();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('tutorial_seen', 'true');
    setTutorialSeen(true);
  };
  
  // Skip tutorial if already seen
  if (tutorialSeen || !isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-wealthmap-dark">{steps[currentStep].title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close tutorial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {steps[currentStep].image && (
            <div className="mb-4 bg-gray-100 rounded-lg p-2 flex items-center justify-center">
              <div className="w-full h-40 bg-gray-200 animate-pulse-light rounded flex items-center justify-center text-gray-400">
                Tutorial Image Placeholder
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full w-6 ${
                    index === currentStep ? 'bg-wealthmap-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Previous step"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-wealthmap-primary hover:bg-blue-600 text-white rounded-md transition-colors"
                aria-label={currentStep < steps.length - 1 ? "Next step" : "Finish tutorial"}
              >
                {currentStep < steps.length - 1 ? "Next" : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
