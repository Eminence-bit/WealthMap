
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PermissionForm } from './PermissionForm';
import { UserWithDetails, Permission, UserActivity } from '@/lib/admin-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function EmployeeList() {
  const [employees, setEmployees] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Get the current user's company ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First get the company ID from the current user
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw userError;
      }

      // Now get all users with this company ID
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          company_id,
          created_at,
          permissions:permissions(id, user_id, role, updated_at)
        `)
        .eq('company_id', currentUser.company_id);

      if (usersError) {
        throw usersError;
      }

      // For each user, get their activity data
      const usersWithActivity = await Promise.all(
        users.map(async (user) => {
          const { data: activity, error: activityError } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', user.id);

          if (activityError) {
            console.error('Error fetching activity for user:', user.id, activityError);
            return {
              ...user,
              user_activity: [] as UserActivity[],
              permissions: (user.permissions || []).map(p => ({
                ...p,
                role: p.role as 'admin' | 'employee'
              })) as Permission[]
            };
          }

          return {
            ...user,
            user_activity: activity || [],
            permissions: (user.permissions || []).map(p => ({
              ...p,
              role: p.role as 'admin' | 'employee'
            })) as Permission[]
          } as UserWithDetails;
        })
      );

      setEmployees(usersWithActivity);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: error.message || "Could not load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle revoking access for an employee
  const handleRevokeAccess = async (userId: string, email: string) => {
    // Confirmation dialog
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) {
      return;
    }

    try {
      // Delete the user record - cascade will remove permissions and activity
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Access Revoked",
        description: `Access for ${email} has been revoked`,
      });

      // Refresh the employee list
      fetchEmployees();
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: error.message || "Could not revoke access",
        variant: "destructive",
      });
    }
  };

  // Count activities by type for a user
  const countActivities = (user: UserWithDetails, actionType: string) => {
    return (user.user_activity || []).filter(activity => activity.action === actionType).length;
  };

  // Get user permission role (defaulting to 'employee')
  const getUserRole = (user: UserWithDetails): 'admin' | 'employee' => {
    if (!user.permissions || user.permissions.length === 0) {
      return 'employee';
    }
    return user.permissions[0].role;
  };

  if (loading) {
    return <div className="text-center p-6">Loading employees...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b">Employee Management</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Logins</TableHead>
              <TableHead>Searches</TableHead>
              <TableHead>Properties Viewed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <PermissionForm 
                      userId={employee.id} 
                      currentRole={getUserRole(employee)} 
                      onRoleUpdated={fetchEmployees} 
                    />
                  </TableCell>
                  <TableCell>{countActivities(employee, 'login')}</TableCell>
                  <TableCell>{countActivities(employee, 'search')}</TableCell>
                  <TableCell>{countActivities(employee, 'property_view')}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive"
                      size="sm" 
                      onClick={() => handleRevokeAccess(employee.id, employee.email)}
                    >
                      Revoke Access
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
