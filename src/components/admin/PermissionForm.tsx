
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface PermissionFormProps {
  userId: string;
  currentRole: 'admin' | 'employee';
  onRoleUpdated?: () => void;
}

export function PermissionForm({ userId, currentRole, onRoleUpdated }: PermissionFormProps) {
  const [role, setRole] = useState<'admin' | 'employee'>(currentRole);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (role === currentRole) {
      toast({
        description: "No changes to save",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('permissions')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Role Updated",
        description: `User role updated to ${role}`,
      });

      // Call the callback function if provided
      if (onRoleUpdated) {
        onRoleUpdated();
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Update failed",
        description: error.message || "Could not update role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'admin' | 'employee')}
        className="p-1 border rounded text-sm"
        disabled={loading}
      >
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
      </select>
      <Button 
        onClick={handleUpdate} 
        size="sm" 
        disabled={loading || role === currentRole}
      >
        {loading ? '...' : 'Save'}
      </Button>
    </div>
  );
}
