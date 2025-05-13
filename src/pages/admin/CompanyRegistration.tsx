
import React from 'react';
import { CompanyForm } from '@/components/admin/CompanyForm';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function CompanyRegistration() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Wealth Map Challenge</h1>
        <div className="max-w-2xl mx-auto">
          <CompanyForm />
        </div>
      </div>
    </AdminLayout>
  );
}
