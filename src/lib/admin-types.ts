
export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  data_access: {
    zillow: boolean;
    wealth_engine: boolean;
    reportall: boolean;
  };
  created_at: string;
}

export interface Permission {
  id: string;
  user_id: string;
  role: 'admin' | 'employee';
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: 'login' | 'property_view' | 'search';
  timestamp: string;
}

export interface UserWithDetails {
  id: string;
  email: string;
  company_id?: string | null;
  created_at: string;
  permissions?: Permission[];
  user_activity?: UserActivity[];
}

export interface DashboardStats {
  employees: number;
  properties: number;
  logins: number;
  searches: number;
}
