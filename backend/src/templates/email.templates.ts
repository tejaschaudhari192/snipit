export const EMAIL_TEMPLATES = {
	ACCESS_GRANTED: (
		role: string,
		pasteId: string,
		pasteUrl: string,
	) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snipit Access Granted</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #1e1b4b;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); margin: 0 20px;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.05em;">Snipit</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #4338ca; text-align: center;">Access Granted</h2>
                            
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
                                You've been granted <strong>${role}</strong> access to a snippet. You're now a collaborator on this content!
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <a href="${pasteUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">View Snippet</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="color: #6d28d9; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">Snippet Details</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #4b5563; font-size: 15px;">
                                            <strong>ID:</strong> <code style="font-family: 'JetBrains Mono', 'Fira Code', monospace; color: #7c3aed; background: #ede9fe; padding: 2px 6px; border-radius: 4px;">${pasteId}</code>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #4b5563; font-size: 15px; padding-top: 8px;">
                                            <strong>Role:</strong> <span style="color: #7c3aed;">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
                            
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8; text-align: center;">
                                Join the Snipit community and start sharing code effortlessly.<br>
                                <span style="font-size: 12px;">© 2026 Snipit. All rights reserved.</span>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
	PASSWORD_RESET: (resetUrl: string) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snipit Password Reset</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #1e1b4b;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); margin: 0 20px;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.05em;">Snipit</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #4338ca; text-align: center;">Reset Your Password</h2>
                            
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
                                You requested a password reset. Click the button below to choose a new password. This link will expire in 10 minutes.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 32px; font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">
                                If you did not request this reset, you can safely ignore this email.
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
                            
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8; text-align: center;">
                                Join the Snipit community and start sharing code effortlessly.<br>
                                <span style="font-size: 12px;">© 2026 Snipit. All rights reserved.</span>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
};
