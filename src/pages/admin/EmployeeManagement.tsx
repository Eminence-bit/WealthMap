
import React from 'react';
import { EmployeeInviteForm } from '@/components/admin/EmployeeInviteForm';
import { EmployeeList } from '@/components/admin/EmployeeList';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function EmployeeManagement() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EmployeeInviteForm />
          </div>
          <div className="lg:col-span-2">
            <EmployeeList />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
