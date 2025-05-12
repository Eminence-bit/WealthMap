
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Environment variables will be set via Lovable project settings 
// and injected at build time
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if we're missing credentials
// This prevents the app from crashing but won't work for actual data
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  
  // Create a mock client that returns empty data rather than throwing errors
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: async () => ({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      insert: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
  };
  
  // Show a toast notification if we're in a browser environment
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      toast({
        title: "Supabase Connection Error",
        description: "Missing Supabase credentials. Some features may not work correctly.",
        variant: "destructive",
      });
    }, 1000);
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
