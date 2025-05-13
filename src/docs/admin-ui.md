
# Admin UI Documentation

## Overview

The Admin UI enables company administrators to manage their Wealth Map platform. Key features include:
- Company registration
- Employee management
- Data access preferences
- Dashboard with activity statistics

## Pages

### CompanyRegistration
- Path: `/company/register`
- Purpose: Register a new company with name, logo, and contact email
- Features:
  - Company name validation
  - Logo upload (max 5MB)
  - Contact email validation
  - Automatic admin permission assignment

### Dashboard
- Path: `/admin/dashboard`
- Purpose: Display company statistics and quick access to admin functions
- Features:
  - Key metrics (employees, property views, logins, searches)
  - Quick action buttons for common tasks
  - Recent activity overview

### EmployeeManagement
- Path: `/admin/employees`
- Purpose: Invite new employees and manage existing ones
- Features:
  - Employee invitation form
  - Employee list with activity statistics
  - Role management (admin/employee)
  - Access revocation

### DataPreferences
- Path: `/admin/preferences`
- Purpose: Configure data API access for the company
- Features:
  - Toggle API access (Zillow, Wealth Engine, ReportAll)
  - Saves preferences to company record

## Components

### AdminLayout
- Purpose: Provides consistent layout for all admin pages
- Includes: Sidebar navigation, responsive container, and toast notifications

### AdminSidebar
- Purpose: Navigation component for admin and employee pages
- Features:
  - Links to all admin pages
  - Sign out functionality
  - Active page highlighting

### AdminProtectedRoute
- Purpose: Route protection for admin-only pages
- Functionality:
  - Verifies user authentication
  - Checks for admin permission
  - Redirects unauthorized users

### CompanyForm
- Purpose: Form component for company registration
- Features:
  - Input validation
  - Logo upload and storage
  - Company record creation
  - User permission assignment

### EmployeeInviteForm
- Purpose: Form component for sending employee invitations
- Features:
  - Email validation
  - Creates pending user records
  - Default employee permission assignment

### EmployeeList
- Purpose: Display and manage company employees
- Features:
  - Role management with PermissionForm
  - Activity statistics display
  - Access revocation functionality

### PermissionForm
- Purpose: Change user role between admin and employee
- Features:
  - Role selection dropdown
  - Role update functionality
  - Callback for list refresh

### DataPreferencesForm
- Purpose: Configure company data access settings
- Features:
  - Toggle switches for each API
  - Saves preferences to company record

### DashboardStats
- Purpose: Display key company metrics
- Features:
  - Employee count
  - Property view count
  - Login count
  - Search count

## Integration with Employee UI

The Admin UI integrates with the existing Employee UI through:
- Shared authentication flow
- Common layout components
- Consistent styling
- Unified navigation

## Permissions Model

- **Admin**: Can access all admin pages, manage employees, configure preferences
- **Employee**: Can access map and property data, but not admin functions

## Best Practices

- All forms include proper validation
- Error handling with toast notifications
- Responsive design for all screen sizes
- Accessibility features (labels, keyboard navigation)
- Loading states for asynchronous operations
