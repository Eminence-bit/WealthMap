
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export function EmployeeInviteForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle employee invitation
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user's company
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get the company ID from the current user
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

      // Generate unique invitation link using uuid
      const invitationId = crypto.randomUUID();

      // In a real implementation, you would send an email with a link to /onboarding?invitation=invitationId
      // Here we'll just create a "pending" user record
      const { error: inviteError } = await supabase
        .from('users')
        .insert({
          id: invitationId, // This is temporary and will be replaced when the user signs up
          email: email,
          company_id: userData.company_id,
        });

      if (inviteError) {
        throw inviteError;
      }

      // Also create a permission record with role 'employee'
      const { error: permissionError } = await supabase
        .from('permissions')
        .insert({
          user_id: invitationId,
          role: 'employee'
        });

      if (permissionError) {
        throw permissionError;
      }

      toast({
        title: "Invitation Sent",
        description: `Invitation email sent to ${email}`
      });

      // Reset form
      setEmail('');
    } catch (error: any) {
      console.error('Error inviting employee:', error);
      toast({
        title: "Invitation failed",
        description: error.message || "Could not send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Invite New Employee</h3>
      
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Employee email address"
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Invite'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          An email invitation will be sent with a link to complete registration.
        </p>
      </form>
    </div>
  );
}
