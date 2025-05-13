import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from '@sentry/react';

// Employee UI pages
import Login from "./pages/Login";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

// Admin UI pages
import CompanyRegistration from "./pages/admin/CompanyRegistration";
import Dashboard from "./pages/admin/Dashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import DataPreferences from "./pages/admin/DataPreferences";

// Protected Routes
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";

// Initialize Sentry with provided DSN
const sentryDsn = import.meta.env.VITE_SENTRY_DSN || 'https://206e87f9f44bca9d76b599585be49860@o4509310131240960.ingest.us.sentry.io/4509310133993473';
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

const queryClient = new QueryClient();

const App = () => (
  <Sentry.ErrorBoundary fallback={
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We've encountered an error and our team has been notified.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-wealthmap-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  }>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Auth and Basic Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/company/register" element={<CompanyRegistration />} />
          <Route path="/map" element={<Map />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <AdminProtectedRoute>
              <EmployeeManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/preferences" element={
            <AdminProtectedRoute>
              <DataPreferences />
            </AdminProtectedRoute>
          } />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;
