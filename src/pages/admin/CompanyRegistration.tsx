
import React from 'react';
import { CompanyForm } from '@/components/admin/CompanyForm';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function CompanyRegistration() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Wealth Map Challenge</h1>
          <CompanyForm />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
