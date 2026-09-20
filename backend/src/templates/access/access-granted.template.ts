export const ACCESS_GRANTED = (
	role: string,
	pasteId: string,
	pasteUrl: string,
) => {
	const lowerRole = role.toLowerCase();
	let message =
		"You have been granted viewer access to this workspace. You can now read, inspect, and comment on this code snippet dynamically.";

	if (lowerRole === "admin") {
		message =
			"You have been granted administrative access to this workspace. You can now read, edit, and fully manage this code snippet dynamically.";
	} else if (lowerRole === "editor") {
		message =
			"You have been granted editor access to this workspace. You can now read, collaborate, and edit this code snippet dynamically.";
	}

	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Snipit Access Granted</title>
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        @media (prefers-color-scheme: dark) {
            .email-body {
                background-color: #030712 !important;
            }
            .email-container {
                background-color: #09090b !important;
                border-color: #1f2937 !important;
            }
            .email-header {
                border-bottom-color: #1f2937 !important;
                color: #ffffff !important;
            }
            .email-title {
                color: #ffffff !important;
            }
            .email-text {
                color: #9ca3af !important;
            }
            .inner-card {
                background-color: #111827 !important;
                border-color: #1f2937 !important;
            }
            .card-label {
                color: #9ca3af !important;
            }
            .card-value {
                color: #ffffff !important;
            }
            .code-badge {
                background-color: #1f2937 !important;
                border-color: #374151 !important;
                color: #f3f4f6 !important;
            }
            .btn-primary {
                background-color: #fafafa !important;
                color: #09090b !important;
                border-color: #fafafa !important;
            }
            .footer-text {
                color: #6b7280 !important;
            }
            .footer-subtext {
                color: #4b5563 !important;
            }
            .avatar-cell {
                background-color: rgba(168, 85, 247, 0.1) !important;
                border-color: rgba(168, 85, 247, 0.25) !important;
            }
        }
    </style>
</head>
<body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 40px 0; color: #09090b;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="email-container" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; margin: 0 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                    <!-- Header -->
                    <tr>
                        <td class="email-header" style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e4e4e7; color: #09090b;">
                            <h1 class="email-title" style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.03em;">Snipit</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px; text-align: center;">
                            <!-- Invitation Badge Visual -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-collapse: collapse;">
                                    <tr>
                                        <td class="avatar-cell" align="center" valign="middle" style="width: 48px; height: 48px; background-color: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 50%;">
                                            <table cellpadding="0" cellspacing="0" width="100%" height="100%" style="border-collapse: collapse;">
                                                <tr>
                                                    <td align="center" valign="middle" style="font-size: 20px; text-align: center; padding: 0; margin: 0; line-height: 1;">
                                                        🤝
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <h2 class="email-title" style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #09090b; letter-spacing: -0.02em; text-align: center;">Workspace Access Shared</h2>
                            
                            <p class="email-text" style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
                                ${message}
                            </p>
                            
                            <!-- Permission Matrix Grid -->
                            <div class="inner-card" style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                                    <tr>
                                        <td class="card-label" style="color: #71717a; padding: 6px 0;">Workspace Role</td>
                                        <td align="right" style="padding: 6px 0;">
                                            <span style="background-color: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); color: #8b5cf6; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 4px; padding: 2px 8px;">${role}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="card-label" style="color: #71717a; padding: 6px 0;">Paste Reference</td>
                                        <td align="right" style="padding: 6px 0;">
                                            <code class="code-badge" style="font-family: 'JetBrains Mono', 'Fira Code', monospace; color: #09090b; background-color: #e4e4e7; border: 1px solid #d4d4d8; border-radius: 4px; padding: 2px 6px; font-size: 12px;">${pasteId}</code>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="card-label" style="color: #71717a; padding: 6px 0;">Status</td>
                                        <td class="card-value" align="right" style="color: #10b981; font-weight: 500; padding: 6px 0; font-size: 13px;">Active</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a class="btn-primary" href="${pasteUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 28px; border-radius: 6px; border: 1px solid #18181b; letter-spacing: -0.01em;">View Workspace</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <hr class="inner-card" style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
                            
                            <p class="footer-text" style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a; text-align: center;">
                                Join the Snipit community and start sharing code effortlessly.<br>
                                <span class="footer-subtext" style="font-size: 11px; color: #a1a1aa;">© 2026 Snipit. All rights reserved.</span>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
