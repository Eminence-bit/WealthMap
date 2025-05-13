
import { AdminSidebar } from './AdminSidebar';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}
