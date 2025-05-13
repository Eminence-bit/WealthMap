
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { DashboardStats as DashboardStatsType } from '@/lib/admin-types';

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType>({
    employees: 0,
    properties: 0,
    logins: 0,
    searches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Get user's company ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw userError;
        }

        if (!userData.company_id) {
          throw new Error('User not associated with a company');
        }

        // Get employees count
        const { count: employeesCount, error: employeesError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', userData.company_id);

        if (employeesError) {
          throw employeesError;
        }

        // Get recent activities
        const { data: activities, error: activitiesError } = await supabase
          .from('user_activity')
          .select('action, user_id')
          .in('user_id', 
            supabase
              .from('users')
              .select('id')
              .eq('company_id', userData.company_id)
          );

        if (activitiesError) {
          throw activitiesError;
        }

        // Count activities by type
        const loginCount = activities?.filter(a => a.action === 'login').length || 0;
        const searchCount = activities?.filter(a => a.action === 'search').length || 0;
        const propertyViewCount = activities?.filter(a => a.action === 'property_view').length || 0;

        setStats({
          employees: employeesCount || 0,
          properties: propertyViewCount,  // Using property views as a proxy for properties
          logins: loginCount,
          searches: searchCount
        });

      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: error.message || "Could not load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="p-6 bg-white rounded-lg shadow-md animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Employees</h3>
        <p className="text-3xl font-semibold mt-2">{stats.employees}</p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Properties Viewed</h3>
        <p className="text-3xl font-semibold mt-2">{stats.properties}</p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Total Logins</h3>
        <p className="text-3xl font-semibold mt-2">{stats.logins}</p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Property Searches</h3>
        <p className="text-3xl font-semibold mt-2">{stats.searches}</p>
      </div>
    </div>
  );
}
