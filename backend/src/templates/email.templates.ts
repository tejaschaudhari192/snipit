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
	LOGIN_NOTIFICATION: (
		username: string,
		deviceName: string,
		browser: string,
		os: string,
		ipAddress: string,
		location: string,
		deviceType: "desktop" | "mobile" | "tablet",
		resetUrl: string,
	) => {
		const isMobile = deviceType === "mobile";
		const isDesktop = deviceType === "desktop";

		let deviceSvg = "";
		if (isDesktop) {
			deviceSvg = `
<svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block;">
  <rect x="10" y="10" width="100" height="60" rx="6" fill="#1e1b4b" stroke="#6366f1" stroke-width="3"/>
  <rect x="15" y="15" width="90" height="50" rx="3" fill="#6366f1" fill-opacity="0.15"/>
  <circle cx="60" cy="74" r="3" fill="#6366f1"/>
  <path d="M50 70 L40 85 L80 85 L70 70 Z" fill="#4338ca"/>
</svg>`;
		} else if (isMobile) {
			deviceSvg = `
<svg width="70" height="110" viewBox="0 0 70 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block;">
  <rect x="10" y="10" width="50" height="90" rx="10" fill="#1e1b4b" stroke="#a855f7" stroke-width="3"/>
  <rect x="14" y="18" width="42" height="74" rx="6" fill="#a855f7" fill-opacity="0.15"/>
  <rect x="28" y="10" width="14" height="4" rx="2" fill="#1e1b4b"/>
  <line x1="25" y1="94" x2="45" y2="94" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
</svg>`;
		} else {
			deviceSvg = `
<svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block;">
  <rect x="10" y="10" width="70" height="90" rx="8" fill="#1e1b4b" stroke="#3b82f6" stroke-width="3"/>
  <rect x="15" y="15" width="60" height="80" rx="4" fill="#3b82f6" fill-opacity="0.15"/>
  <circle cx="45" cy="100" r="3" fill="#3b82f6"/>
</svg>`;
		}

		return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snipit Login Notification</title>
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
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #4338ca; text-align: center;">New Login Detected</h2>
                            
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
                                Hello <strong>${username}</strong>, a new login was detected for your account. Please review the device and location details below.
                            </p>
                            
                            <!-- Device Diagram -->
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                                ${deviceSvg}
                                <div style="margin-top: 16px; font-size: 16px; font-weight: 700; color: #1e1b4b;">
                                    ${deviceName}
                                </div>
                                <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
                                    ${os} • ${browser}
                                </div>
                            </div>
                            
                            <!-- Information Grid -->
                            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="color: #6d28d9; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 12px;" colspan="2">Login Details</td>
                                    </tr>
                                    <tr>
                                        <td width="30%" style="color: #4b5563; font-size: 14px; padding-bottom: 8px;"><strong>Location:</strong></td>
                                        <td width="70%" style="color: #1e1b4b; font-size: 14px; padding-bottom: 8px;">${location}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #4b5563; font-size: 14px; padding-bottom: 8px;"><strong>IP Address:</strong></td>
                                        <td style="color: #1e1b4b; font-size: 14px; padding-bottom: 8px;"><code style="font-family: 'JetBrains Mono', monospace; background-color: #ede9fe; padding: 2px 6px; border-radius: 4px; color: #6d28d9;">${ipAddress}</code></td>
                                    </tr>
                                    <tr>
                                        <td style="color: #4b5563; font-size: 14px;"><strong>Time:</strong></td>
                                        <td style="color: #1e1b4b; font-size: 14px;">${new Date().toUTCString()}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- What is possible / Security Checklist -->
                            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #1e1b4b;">Security Checklist & Actions</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                                    <li style="margin-bottom: 8px;"><strong>If this was you:</strong> You're all set! No further action is required.</li>
                                    <li><strong>If this was NOT you:</strong> Your account may be compromised. Please click the button below to reset your password and secure your account immediately.</li>
                                </ul>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <a href="${resetUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);">Secure Account (Reset Password)</a>
                                    </td>
                                </tr>
                            </table>
                            
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
</html>`;
	},
};
