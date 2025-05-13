import { supabase } from '@/integrations/supabase/client';

export type ActivityType =
    | 'login'
    | 'logout'
    | 'search'
    | 'view_property'
    | 'create_report'
    | 'update_report'
    | 'delete_report'
    | 'bookmark_property'
    | 'remove_bookmark'
    | 'update_settings'
    | 'invite_employee'
    | 'update_permissions'
    | 'revoke_access';

interface ActivityDetails {
    [key: string]: any;
}

export const trackActivity = async (
    userId: string,
    type: ActivityType,
    details: ActivityDetails = {}
): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('user_activity')
        .insert({
            user_id: userId,
            action: type,
            details,
            timestamp: new Date().toISOString()
        });

    return { error };
};

export const getActivityByType = async (
    userId: string,
    type: ActivityType,
    limit: number = 50
): Promise<{ data: any[]; error: any }> => {
    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('action', type)
        .order('timestamp', { ascending: false })
        .limit(limit);

    return { data, error };
};

export const getActivityByDateRange = async (
    userId: string,
    startDate: string,
    endDate: string
): Promise<{ data: any[]; error: any }> => {
    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });

    return { data, error };
};

export const getActivitySummary = async (
    userId: string,
    startDate: string,
    endDate: string
): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase
        .from('user_activity')
        .select('action, count')
        .eq('user_id', userId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .group('action');

    return { data, error };
};

// Helper function to track search activity
export const trackSearch = async (
    userId: string,
    searchParams: {
        query?: string;
        filters?: Record<string, any>;
        resultsCount: number;
    }
): Promise<{ error: any }> => {
    return trackActivity(userId, 'search', {
        query: searchParams.query,
        filters: searchParams.filters,
        results_count: searchParams.resultsCount
    });
};

// Helper function to track property view
export const trackPropertyView = async (
    userId: string,
    propertyId: string,
    viewDuration: number
): Promise<{ error: any }> => {
    return trackActivity(userId, 'view_property', {
        property_id: propertyId,
        view_duration: viewDuration
    });
};

// Helper function to track report creation
export const trackReportCreation = async (
    userId: string,
    reportId: string,
    reportType: string
): Promise<{ error: any }> => {
    return trackActivity(userId, 'create_report', {
        report_id: reportId,
        report_type: reportType
    });
};

// Helper function to track employee management
export const trackEmployeeManagement = async (
    adminId: string,
    employeeId: string,
    action: 'invite_employee' | 'update_permissions' | 'revoke_access',
    details: Record<string, any>
): Promise<{ error: any }> => {
    return trackActivity(adminId, action, {
        employee_id: employeeId,
        ...details
    });
}; 