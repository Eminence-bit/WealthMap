
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

// Property-related interfaces
export interface Property {
  id: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  size_sqft?: number | null;
  value_usd?: number | null;
  owner_name?: string | null;
  zip_code: string;
  wealth_estimate_usd?: number | null;
  wealth_confidence?: number | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface SearchFilter {
  id: string;
  user_id: string;
  name: string;
  filter_params: {
    min_value_usd?: number;
    max_value_usd?: number;
    min_size_sqft?: number;
    max_size_sqft?: number;
    zip_code?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface PropertyTransaction {
  id: string;
  property_id: string;
  transaction_date: string;
  price_usd: number;
  transaction_type: string;
  created_at: string;
}

export interface ZipCode {
  zip_code: string;
  city: string;
  state: string;
  median_income?: number | null;
  population?: number | null;
  geo_data?: any;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  report_data: any;
  created_at: string;
}
