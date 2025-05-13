
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export function CompanyForm() {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Company name and contact email are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload logo if provided
      let logoUrl = '';
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company_logos')
          .upload(fileName, logo);
        
        if (uploadError) {
          throw uploadError;
        }

        // Get public URL for the uploaded logo
        const { data: publicUrlData } = supabase.storage
          .from('company_logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrlData.publicUrl;
      }

      // Create company record
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({ 
          name, 
          logo_url: logoUrl || null,
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert or update user record
      const { error: userError } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          email: email || user.email,
          company_id: companyData.id
        });

      if (userError) {
        throw userError;
      }

      // Create admin permission for the user
      const { error: permissionError } = await supabase
        .from('permissions')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (permissionError) {
        throw permissionError;
      }

      toast({
        title: "Success!",
        description: "Company registered successfully",
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1500);

    } catch (error: any) {
      console.error('Error registering company:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not register company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Register Your Company</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="logo" className="block text-sm font-medium">
            Company Logo
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500">Max size: 5MB. Recommended: 200x200px.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter contact email"
            required
          />
        </div>

        <Button 
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Company'}
        </Button>
      </form>
    </div>
  );
}
