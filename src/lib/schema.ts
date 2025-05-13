import { supabase } from '@/integrations/supabase/client';

export type Role = 'admin' | 'employee';

export interface User {
    id: string;
    email: string;
    company_id?: string;
    notification_prefs: {
        sms: boolean;
        email: boolean;
    };
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: string;
    user_id: string;
    role: Role;
    updated_at: string;
}

export interface Company {
    id: string;
    name: string;
    logo_url?: string;
    data_access: {
        zillow: boolean;
        reportall: boolean;
        wealth_engine: boolean;
    };
    created_at: string;
    updated_at: string;
}

export interface Property {
    id: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    size_sqft?: number;
    value_usd?: number;
    owner_name?: string;
    zip_code: string;
    wealth_estimate_usd?: number;
    wealth_confidence?: number;
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

export interface Bookmark {
    id: string;
    user_id: string;
    property_id: string;
    created_at: string;
}

export interface Report {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    report_data: Record<string, any>;
    created_at: string;
}

export interface SearchFilter {
    id: string;
    user_id: string;
    name: string;
    filter_params: Record<string, any>;
    created_at: string;
}

export interface UserActivity {
    id: string;
    user_id: string;
    action: string;
    timestamp: string;
}

export interface ZipCode {
    zip_code: string;
    city: string;
    state: string;
    median_income?: number;
    population?: number;
    geo_data?: {
        lat: number;
        lng: number;
    };
}

export interface EmployeeInvite {
    id: string;
    email: string;
    role: Role;
    company_id: string;
    invited_by: string;
    status: 'pending' | 'accepted' | 'expired';
    created_at: string;
    expires_at: string;
}

export interface UserAgreement {
    id: string;
    user_id: string;
    agreement_type: 'terms_of_service' | 'privacy_policy';
    accepted_at: string;
}

export interface UserOnboarding {
    id: string;
    user_id: string;
    completed_at: string;
    steps_completed: string[];
}

// Permission check helpers
export const isAdmin = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('permissions')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

    return !error && data !== null;
};

export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
    const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(p => ({
        ...p,
        role: p.role as Role
    }));
};

// Database queries with permission checks
export const getUserWithPermissions = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            permissions (
                id,
                role,
                updated_at
            )
        `)
        .eq('id', userId)
        .single();

    return { data, error };
};

export const createUserWithRole = async (userId: string, email: string, role: Role) => {
    // Create user with default notification preferences
    const { error: userError } = await supabase
        .from('users')
        .insert({
            id: userId,
            email,
            notification_prefs: {
                sms: false,
                email: true
            }
        });

    if (userError) return { error: userError };

    // Create permission with role
    const { error: permissionError } = await supabase
        .from('permissions')
        .insert({
            user_id: userId,
            role
        });

    return { error: permissionError };
};

// Policy-enforced queries
export const getCompanyData = async (userId: string) => {
    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
        throw new Error('Only admins can access company data');
    }

    const { data, error } = await supabase
        .from('companies')
        .select('*');

    return { data, error };
};

export const getUserActivity = async (userId: string) => {
    const isUserAdmin = await isAdmin(userId);
    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq(isUserAdmin ? '1' : 'user_id', isUserAdmin ? '1' : userId);

    return { data, error };
};

export const getReports = async (userId: string) => {
    const isUserAdmin = await isAdmin(userId);
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq(isUserAdmin ? '1' : 'user_id', isUserAdmin ? '1' : userId);

    return { data, error };
};

export const getBookmarks = async (userId: string) => {
    const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId);

    return { data, error };
};

export const getSearchFilters = async (userId: string) => {
    const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .eq('user_id', userId);

    return { data, error };
};

// Helper to check if user has access to a specific resource
export const checkResourceAccess = async (userId: string, resourceType: 'bookmark' | 'search_filter' | 'report' | 'activity', resourceId: string): Promise<boolean> => {
    const isUserAdmin = await isAdmin(userId);

    // Admins have access to everything
    if (isUserAdmin) return true;

    // Check specific resource ownership
    switch (resourceType) {
        case 'bookmark':
            const { data: bookmarkData } = await supabase
                .from('bookmarks')
                .select('user_id')
                .eq('id', resourceId)
                .single();
            return bookmarkData?.user_id === userId;

        case 'search_filter':
            const { data: filterData } = await supabase
                .from('search_filters')
                .select('user_id')
                .eq('id', resourceId)
                .single();
            return filterData?.user_id === userId;

        case 'report':
            const { data: reportData } = await supabase
                .from('reports')
                .select('user_id')
                .eq('id', resourceId)
                .single();
            return reportData?.user_id === userId;

        case 'activity':
            const { data: activityData } = await supabase
                .from('user_activity')
                .select('user_id')
                .eq('id', resourceId)
                .single();
            return activityData?.user_id === userId;

        default:
            return false;
    }
}; 