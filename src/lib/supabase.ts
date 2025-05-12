
import { createClient } from '@supabase/supabase-js';

// Environment variables will be set via Lovable project settings 
// and injected at build time
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
