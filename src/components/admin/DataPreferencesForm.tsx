
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DataPreferencesForm() {
  const [preferences, setPreferences] = useState({
    zillow: true,
    wealth_engine: true,
    reportall: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCompanyPreferences = async () => {
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

        // Get company data with preferences
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('data_access')
          .eq('id', userData.company_id)
          .single();

        if (companyError) {
          throw companyError;
        }

        // Update state with company preferences
        if (companyData && companyData.data_access) {
          setPreferences(companyData.data_access);
        }
      } catch (error: any) {
        console.error('Error fetching company preferences:', error);
        toast({
          title: "Error",
          description: error.message || "Could not load data access preferences",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyPreferences();
  }, []);

  const handleSavePreferences = async () => {
    setSaving(true);

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

      // Update company preferences
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          data_access: preferences
        })
        .eq('id', userData.company_id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Preferences Saved",
        description: "Data access preferences updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Could not save data access preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading preferences...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Data Access Preferences</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="zillow" className="font-medium">Zillow API</Label>
            <p className="text-sm text-gray-500">Access to property valuations and market data</p>
          </div>
          <Switch 
            id="zillow"
            checked={preferences.zillow}
            onCheckedChange={(checked) => setPreferences({...preferences, zillow: checked})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="wealth_engine" className="font-medium">Wealth Engine API</Label>
            <p className="text-sm text-gray-500">Access to wealth estimation data</p>
          </div>
          <Switch 
            id="wealth_engine"
            checked={preferences.wealth_engine}
            onCheckedChange={(checked) => setPreferences({...preferences, wealth_engine: checked})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="reportall" className="font-medium">ReportAll API</Label>
            <p className="text-sm text-gray-500">Access to property reports and analytics</p>
          </div>
          <Switch 
            id="reportall"
            checked={preferences.reportall}
            onCheckedChange={(checked) => setPreferences({...preferences, reportall: checked})}
          />
        </div>
        
        <Button 
          onClick={handleSavePreferences} 
          className="w-full mt-4" 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
