
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function CompanyForm() {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !email) {
      setError("Company name and contact email are required");
      toast({
        title: "Error",
        description: "Company name and contact email are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log("Current user:", user);

      // Create company record first
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({ 
          name, 
          logo_url: null, // We'll update this later if a logo is uploaded
          data_access: {
            zillow: true,
            wealth_engine: true,
            reportall: true
          }
        })
        .select()
        .single();

      if (companyError) {
        console.error("Company creation error:", companyError);
        throw companyError;
      }

      console.log("Company created:", companyData);

      // Upload logo if provided
      let logoUrl = '';
      if (logo && companyData) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${companyData.id}.${fileExt}`;
        
        // Create the storage bucket if it doesn't exist
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('company_logos');
          
        if (bucketError && bucketError.message.includes('not found')) {
          const { error: createBucketError } = await supabase.storage
            .createBucket('company_logos', {
              public: true,
              fileSizeLimit: 5242880 // 5MB
            });
            
          if (createBucketError) {
            console.error("Error creating storage bucket:", createBucketError);
            throw createBucketError;
          }
        }
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company_logos')
          .upload(fileName, logo);
        
        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          // We continue even if logo upload fails
          console.log("Continuing without logo...");
        } else {
          // Get public URL for the uploaded logo
          const { data: publicUrlData } = supabase.storage
            .from('company_logos')
            .getPublicUrl(fileName);
          
          logoUrl = publicUrlData.publicUrl;
          
          // Update company with logo URL
          if (logoUrl) {
            const { error: updateLogoError } = await supabase
              .from('companies')
              .update({ logo_url: logoUrl })
              .eq('id', companyData.id);
              
            if (updateLogoError) {
              console.error("Error updating logo URL:", updateLogoError);
            }
          }
        }
      }

      // Update user record with company ID
      const { error: userError } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          email: email || user.email,
          company_id: companyData.id
        });

      if (userError) {
        console.error("User update error:", userError);
        throw userError;
      }

      console.log("User updated with company ID");

      // Create admin permission for the user
      const { error: permissionError } = await supabase
        .from('permissions')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (permissionError) {
        console.error("Permission creation error:", permissionError);
        throw permissionError;
      }

      console.log("Admin permission created");

      toast({
        title: "Success!",
        description: "Company registered successfully",
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error registering company:', error);
      setError(error.message || "Could not register company");
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
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
