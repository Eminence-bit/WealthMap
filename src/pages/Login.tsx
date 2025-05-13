
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user has a company
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('company_id, permissions(role)')
            .eq('id', session.user.id)
            .single();

          if (userError) throw userError;

          // If no company, redirect to company registration
          if (!userData.company_id) {
            navigate('/company/register');
            return;
          }

          // Check if user is admin
          const isAdmin = userData.permissions?.some((p: any) => p.role === 'admin');
          
          if (isAdmin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/map');
          }
        } catch (error) {
          console.error('Error checking user data:', error);
          // If we can't determine, default to the map
          navigate('/map');
        }
      }
      
      setLoadingSession(false);
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Check if user has a company and permissions
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id, permissions(role)')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;

        // If no company, redirect to company registration
        if (!userData.company_id) {
          navigate('/company/register');
          return;
        }

        // Check if user is admin
        const isAdmin = userData.permissions?.some((p: any) => p.role === 'admin');
        
        toast({
          title: "Logged in",
          description: "You have successfully logged in",
        });

        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/map');
        }
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: "Login failed",
        description: error.message || "Could not log in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Your account has been created. You can now register your company.",
      });

      // Redirect to company registration
      setTimeout(() => {
        navigate('/company/register');
      }, 1500);

    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingSession) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Wealth Map Challenge</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign in to your account</h2>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Sign in'}
              </Button>
              
              <div className="text-center text-sm text-gray-500">or</div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Sign up'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
