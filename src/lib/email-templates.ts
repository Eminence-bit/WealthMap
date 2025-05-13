interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export const getEmployeeInviteTemplate = (
    inviteLink: string,
    companyName: string,
    adminName: string
): EmailTemplate => ({
    subject: `You've been invited to join ${companyName} on WealthMap`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to WealthMap!</h2>
            <p>Hello,</p>
            <p>${adminName} has invited you to join ${companyName} on WealthMap.</p>
            <p>WealthMap is a powerful platform for property research and wealth analysis.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Getting Started</h3>
                <ol>
                    <li>Click the button below to accept your invitation</li>
                    <li>Create your account with a secure password</li>
                    <li>Set up two-factor authentication</li>
                    <li>Complete the brief onboarding tutorial</li>
                </ol>
            </div>
            <a href="${inviteLink}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
                Accept Invitation
            </a>
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                This invitation will expire in 7 days. If you have any questions, please contact your administrator.
            </p>
        </div>
    `,
    text: `
Welcome to WealthMap!

${adminName} has invited you to join ${companyName} on WealthMap.

WealthMap is a powerful platform for property research and wealth analysis.

Getting Started:
1. Click the link below to accept your invitation
2. Create your account with a secure password
3. Set up two-factor authentication
4. Complete the brief onboarding tutorial

Accept your invitation here: ${inviteLink}

This invitation will expire in 7 days. If you have any questions, please contact your administrator.
    `
});

export const getWelcomeEmailTemplate = (
    companyName: string,
    loginUrl: string
): EmailTemplate => ({
    subject: `Welcome to ${companyName} on WealthMap!`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to WealthMap!</h2>
            <p>Your account has been successfully created.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Next Steps</h3>
                <ol>
                    <li>Log in to your account</li>
                    <li>Complete your profile</li>
                    <li>Set up your notification preferences</li>
                    <li>Start exploring the platform</li>
                </ol>
            </div>
            <a href="${loginUrl}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
                Log In Now
            </a>
        </div>
    `,
    text: `
Welcome to WealthMap!

Your account has been successfully created.

Next Steps:
1. Log in to your account
2. Complete your profile
3. Set up your notification preferences
4. Start exploring the platform

Log in here: ${loginUrl}
    `
}); 