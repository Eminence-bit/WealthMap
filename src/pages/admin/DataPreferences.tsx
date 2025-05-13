
import React from 'react';
import { DataPreferencesForm } from '@/components/admin/DataPreferencesForm';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function DataPreferences() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Company Data Preferences</h1>
        
        <div className="max-w-lg mx-auto">
          <DataPreferencesForm />
        </div>
      </div>
    </AdminLayout>
  );
}
