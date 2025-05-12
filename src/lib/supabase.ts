
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Use the provided environment variables or fallback to direct values if needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vlsnwwdntspvrdffgyaq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsc253d2RudHNwdnJkZmZneWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTE0ODksImV4cCI6MjA2MjYyNzQ4OX0.msMjUFt8W2UjBv1gOftYjLMszT2vDUBCo3kLmLVGdBQ';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if connection is working, and show toast notification if there are issues
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using default Supabase credentials. Consider setting VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  
  // Show a toast notification if we're in a browser environment
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      toast({
        title: "Supabase Connection Notice",
        description: "Using default Supabase credentials.",
        variant: "default",
      });
    }, 1000);
  }
}

export { supabase };
