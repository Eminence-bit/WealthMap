
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarksList } from '../components/BookmarksList';
import { supabase } from '../integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { toast } = useToast();
  
  // Check if user is authenticated with Supabase when component loads
  React.useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking authentication:', error);
          throw error;
        }
        
        if (data?.session) {
          // Get user details
          const { data: userData } = await supabase.auth.getUser();
          setUser(userData.user);
        } else {
          // No session found, redirect to login
          navigate('/');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        toast({
          title: "Authentication Error",
          description: "There was a problem checking your login status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    }
    
    checkAuth();
  }, [navigate, toast]);
  
  // Handle property selection (navigate to map and focus on property)
  const handleSelectProperty = (propertyId: string) => {
    // In a real app, we'd pass the property ID to show on the map
    navigate(`/map?property=${propertyId}`);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
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
  
  // Redirect to login if not signed in and auth check is complete
  if (!user && authChecked) {
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
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.full_name || 'User avatar'} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-wealthmap-primary"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-wealthmap-primary flex items-center justify-center text-white text-lg font-medium">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              <div>
                <h1 className="text-xl font-bold text-wealthmap-dark">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Welcome'}
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.email || 'Employee'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => navigate('/map')}
                variant="outline"
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Map
              </Button>
              
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                variant="destructive"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
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
