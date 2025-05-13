
import React from 'react';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          
          <div className="flex space-x-3">
            <Button asChild>
              <Link to="/admin/employees">
                Manage Employees
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/preferences">
                Data Preferences
              </Link>
            </Button>
          </div>
        </div>
        
        <DashboardStats />
        
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500">
              This section will display recent user activity from your company.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/admin/employees">
                  Invite New Employee
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/map">
                  View Property Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
