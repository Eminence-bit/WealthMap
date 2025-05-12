
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { BookmarksList } from '../components/BookmarksList';

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Handle property selection (navigate to map and focus on property)
  const handleSelectProperty = (propertyId: string) => {
    // In a real app, we'd pass the property ID to show on the map
    navigate(`/map?property=${propertyId}`);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    navigate('/');
  };

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-wealthmap-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not signed in
  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header with user info */}
        <div className="bg-white shadow-md">
          <div className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || 'User avatar'} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-wealthmap-primary"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-wealthmap-primary flex items-center justify-center text-white text-lg font-medium">
                  {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              <div>
                <h1 className="text-xl font-bold text-wealthmap-dark">
                  {user?.fullName || user?.firstName || 'Welcome'}
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.emailAddresses[0]?.emailAddress || 'Employee'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/map')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Map
              </button>
              
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-6">
              <a href="#bookmarks" className="text-wealthmap-primary border-b-2 border-wealthmap-primary px-1 py-3 text-sm font-medium">
                Bookmarks
              </a>
              <a href="#settings" className="text-gray-500 hover:text-wealthmap-primary px-1 py-3 text-sm font-medium">
                Settings
              </a>
              <a href="#help" className="text-gray-500 hover:text-wealthmap-primary px-1 py-3 text-sm font-medium">
                Help
              </a>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="py-6 px-4 sm:px-6 lg:px-8" id="bookmarks">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <BookmarksList onSelectProperty={handleSelectProperty} />
          </div>
          
          {/* Additional sections would go here */}
        </div>
      </div>
    </div>
  );
}
