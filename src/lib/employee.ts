import { supabase } from '@/integrations/supabase/client';
import { User, Role } from './schema';

interface EmployeeAccount {
    email: string;
    password: string;
    invite_id: string;
}

interface NotificationPreferences {
    sms: boolean;
    email: boolean;
}

export const acceptInvite = async (inviteId: string, account: EmployeeAccount): Promise<{ data: User | null; error: any }> => {
    // Verify invite exists and is pending
    const { data: invite, error: inviteError } = await supabase
        .from('employee_invites')
        .select('*')
        .eq('id', inviteId)
        .eq('status', 'pending')
        .single();

    if (inviteError || !invite) {
        return { data: null, error: new Error('Invalid or expired invitation') };
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
    });

    if (authError || !authData.user) {
        return { data: null, error: authError };
    }

    // Create user profile
    const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
            id: authData.user.id,
            email: account.email,
            company_id: invite.company_id,
            notification_prefs: {
                sms: false,
                email: true
            }
        })
        .select()
        .single();

    if (userError) return { data: null, error: userError };

    // Create permission
    const { error: permissionError } = await supabase
        .from('permissions')
        .insert({
            user_id: authData.user.id,
            role: invite.role
        });

    if (permissionError) return { data: null, error: permissionError };

    // Update invite status
    const { error: updateError } = await supabase
        .from('employee_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

    if (updateError) return { data: null, error: updateError };

    return { data: user, error: null };
};

export const setupMFA = async (userId: string): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
    });

    return { data, error };
};

export const verifyMFA = async (userId: string, code: string): Promise<{ error: any }> => {
    const { error } = await supabase.auth.mfa.challenge({
        factorId: userId,
        code
    });

    return { error };
};

export const updateNotificationPreferences = async (
    userId: string,
    preferences: NotificationPreferences
): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('users')
        .update({ notification_prefs: preferences })
        .eq('id', userId);

    return { error };
};

export const acceptTermsOfService = async (userId: string): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('user_agreements')
        .insert({
            user_id: userId,
            agreement_type: 'terms_of_service',
            accepted_at: new Date().toISOString()
        });

    return { error };
};

export const completeOnboarding = async (userId: string): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('user_onboarding')
        .insert({
            user_id: userId,
            completed_at: new Date().toISOString(),
            steps_completed: ['account_setup', 'mfa_setup', 'terms_accepted', 'tutorial_completed']
        });

    return { error };
};

export const getOnboardingStatus = async (userId: string): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

    return { data, error };
}; 