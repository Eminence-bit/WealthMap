import { supabase } from '@/integrations/supabase/client';
import { Company, User, Role } from './schema';

interface CompanyRegistration {
    name: string;
    logo_url?: string;
    data_access?: {
        zillow: boolean;
        reportall: boolean;
        wealth_engine: boolean;
    };
}

interface EmployeeInvite {
    email: string;
    role: Role;
    company_id: string;
}

export const registerCompany = async (adminId: string, companyData: CompanyRegistration): Promise<{ data: Company | null; error: any }> => {
    // Verify admin status
    const isUserAdmin = await supabase
        .from('permissions')
        .select('role')
        .eq('user_id', adminId)
        .eq('role', 'admin')
        .single();

    if (!isUserAdmin.data) {
        return { data: null, error: new Error('Only admins can register companies') };
    }

    // Create company
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
            name: companyData.name,
            logo_url: companyData.logo_url,
            data_access: companyData.data_access || {
                zillow: true,
                reportall: true,
                wealth_engine: true
            }
        })
        .select()
        .single();

    if (companyError) return { data: null, error: companyError };

    // Update admin's company_id
    const { error: userError } = await supabase
        .from('users')
        .update({ company_id: company.id })
        .eq('id', adminId);

    if (userError) return { data: null, error: userError };

    return { data: company, error: null };
};

export const inviteEmployee = async (adminId: string, invite: EmployeeInvite): Promise<{ error: any }> => {
    // Verify admin status and company ownership
    const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', adminId)
        .single();

    if (adminError || adminData.company_id !== invite.company_id) {
        return { error: new Error('Unauthorized to invite employees') };
    }

    // Create invitation record
    const { error: inviteError } = await supabase
        .from('employee_invites')
        .insert({
            email: invite.email,
            role: invite.role,
            company_id: invite.company_id,
            invited_by: adminId,
            status: 'pending'
        });

    if (inviteError) return { error: inviteError };

    // TODO: Send invitation email
    // This would be implemented with your email service

    return { error: null };
};

export const updateEmployeePermissions = async (
    adminId: string,
    employeeId: string,
    newRole: Role
): Promise<{ error: any }> => {
    // Verify admin status and company ownership
    const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', adminId)
        .single();

    if (adminError) return { error: adminError };

    const { data: employeeData, error: employeeError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', employeeId)
        .single();

    if (employeeError || employeeData.company_id !== adminData.company_id) {
        return { error: new Error('Unauthorized to update employee permissions') };
    }

    // Update permission
    const { error: permissionError } = await supabase
        .from('permissions')
        .update({ role: newRole })
        .eq('user_id', employeeId);

    return { error: permissionError };
};

export const revokeEmployeeAccess = async (
    adminId: string,
    employeeId: string
): Promise<{ error: any }> => {
    // Verify admin status and company ownership
    const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', adminId)
        .single();

    if (adminError) return { error: adminError };

    const { data: employeeData, error: employeeError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', employeeId)
        .single();

    if (employeeError || employeeData.company_id !== adminData.company_id) {
        return { error: new Error('Unauthorized to revoke employee access') };
    }

    // Remove permissions
    const { error: permissionError } = await supabase
        .from('permissions')
        .delete()
        .eq('user_id', employeeId);

    if (permissionError) return { error: permissionError };

    // Remove company association
    const { error: userError } = await supabase
        .from('users')
        .update({ company_id: null })
        .eq('id', employeeId);

    return { error: userError };
};

export const updateCompanyDataAccess = async (
    adminId: string,
    companyId: string,
    dataAccess: {
        zillow: boolean;
        reportall: boolean;
        wealth_engine: boolean;
    }
): Promise<{ error: any }> => {
    // Verify admin status and company ownership
    const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', adminId)
        .single();

    if (adminError || adminData.company_id !== companyId) {
        return { error: new Error('Unauthorized to update company data access') };
    }

    // Update company data access
    const { error: companyError } = await supabase
        .from('companies')
        .update({ data_access: dataAccess })
        .eq('id', companyId);

    return { error: companyError };
};

export const getEmployeeActivity = async (
    adminId: string,
    employeeId: string
): Promise<{ data: any; error: any }> => {
    // Verify admin status and company ownership
    const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', adminId)
        .single();

    if (adminError) return { data: null, error: adminError };

    const { data: employeeData, error: employeeError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', employeeId)
        .single();

    if (employeeError || employeeData.company_id !== adminData.company_id) {
        return { data: null, error: new Error('Unauthorized to view employee activity') };
    }

    // Get employee activity
    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', employeeId)
        .order('timestamp', { ascending: false });

    return { data, error };
}; 