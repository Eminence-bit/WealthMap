
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Use the values from the client file to ensure consistency
const supabaseUrl = 'https://kwwgmofueugonsbgvqtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d2dtb2Z1ZXVnb25zYmd2cXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA5OTEsImV4cCI6MjA2MjYyNjk5MX0.5ZYy76tzIs7wImMhPlRnSy-yEZeXjP-hGoli_QWzoYo';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Check if connection is working, and show toast notification if there are issues
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing.');
  
  // Show a toast notification if we're in a browser environment
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      toast({
        title: "Supabase Connection Issue",
        description: "API configuration is incomplete.",
        variant: "destructive",
      });
    }, 1000);
  }
}

export { supabase };
