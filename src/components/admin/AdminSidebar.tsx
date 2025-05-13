
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Map,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function AdminSidebar() {
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Could not sign out",
        variant: "destructive"
      });
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen bg-slate-800 text-white w-64 flex-shrink-0 fixed left-0 top-0">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6 mt-4">Wealth Map</h2>
        
        <nav className="space-y-1">
          <Link 
            to="/admin/dashboard" 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
              isActive('/admin/dashboard') 
                ? "bg-slate-700 text-white" 
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/admin/employees" 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
              isActive('/admin/employees') 
                ? "bg-slate-700 text-white" 
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <Users size={20} />
            <span>Employees</span>
          </Link>
          
          <Link 
            to="/admin/preferences" 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
              isActive('/admin/preferences') 
                ? "bg-slate-700 text-white" 
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <Settings size={20} />
            <span>Data Preferences</span>
          </Link>
          
          <Link 
            to="/map" 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
              isActive('/map') 
                ? "bg-slate-700 text-white" 
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <Map size={20} />
            <span>Property Map</span>
          </Link>
          
          <Link 
            to="/reports" 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
              isActive('/reports') 
                ? "bg-slate-700 text-white" 
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <FileText size={20} />
            <span>Reports</span>
          </Link>
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex w-full items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
}
