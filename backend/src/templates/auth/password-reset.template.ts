export const PASSWORD_RESET = (resetUrl: string) => {
	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Snipit Password Reset</title>
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
                background-color: rgba(244, 63, 94, 0.1) !important;
                border-color: rgba(244, 63, 94, 0.25) !important;
            }
            .alert-box {
                background-color: rgba(244, 63, 94, 0.05) !important;
                border-color: rgba(244, 63, 94, 0.2) !important;
            }
            .alert-title {
                color: #f43f5e !important;
            }
            .alert-text {
                color: #9ca3af !important;
            }
            .alert-highlight {
                color: #f43f5e !important;
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
                            <!-- Icon Visual -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-collapse: collapse;">
                                    <tr>
                                        <td class="avatar-cell" align="center" valign="middle" style="width: 48px; height: 48px; background-color: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 50%;">
                                            <table cellpadding="0" cellspacing="0" width="100%" height="100%" style="border-collapse: collapse;">
                                                <tr>
                                                    <td align="center" valign="middle" style="font-size: 20px; text-align: center; padding: 0; margin: 0; line-height: 1;">
                                                        🔑
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <h2 class="email-title" style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #09090b; letter-spacing: -0.02em; text-align: center;">Password Reset Requested</h2>
                            
                            <p class="email-text" style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
                                We received a request to reset your credential password. Click the secure key button below to finalize your new password.
                            </p>
                            
                            <!-- Timer Alert Box -->
                            <div class="alert-box" style="background-color: rgba(244, 63, 94, 0.04); border: 1px solid rgba(244, 63, 94, 0.15); border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                                <div class="alert-title" style="font-size: 13px; font-weight: 600; color: #e11d48; margin-bottom: 4px; text-align: center;">⚠️ Expiration Warning</div>
                                <div class="alert-text" style="font-size: 14px; color: #4b5563; line-height: 1.5; text-align: center;">This secure gateway will close in exactly <strong class="alert-highlight" style="color: #e11d48;">10 minutes</strong>. If you did not make this request, you can safely ignore or delete this message.</div>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a class="btn-primary" href="${resetUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 28px; border-radius: 6px; border: 1px solid #18181b; letter-spacing: -0.01em;">Reset Credentials</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
                            
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
