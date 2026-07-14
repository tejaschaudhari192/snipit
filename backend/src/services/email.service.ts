import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";
import { EMAIL_TEMPLATES } from "@/templates/email.templates.js";

class EmailService {
	private isVerified = true;
	private lastErrorMessage: string | null = null;

	public getLastError(): string | null {
		return this.lastErrorMessage;
	}

	public async ensureVerification(): Promise<boolean> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 2000);

			const response = await fetch("https://api.brevo.com/v3/account", {
				method: "GET",
				headers: {
					accept: "application/json",
					"api-key": configurations.brevo.apiKey,
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				this.isVerified = true;
				this.lastErrorMessage = null;
				return true;
			} else {
				const errorData = (await response.json()) as {
					message?: string;
				};
				this.isVerified = false;
				this.lastErrorMessage = errorData.message || "Invalid API key";
				return false;
			}
		} catch (error: unknown) {
			this.isVerified = false;
			this.lastErrorMessage =
				error instanceof Error && error.name === "AbortError"
					? "Verification timed out (Brevo API unreachable)"
					: error instanceof Error
						? error.message
						: "Verification failed";
			return false;
		}
	}

	async verify() {
		return this.isVerified;
	}

	private getFromAddress(): string {
		return configurations.brevo.sender;
	}

	async sendAccessGrantedEmail(
		toEmail: string,
		role: "viewer" | "editor" | "commenter" | "admin",
		pasteId: string,
		pasteUrl: string,
	) {
		try {
			logger.info(
				`Attempting to send access granted email via Brevo to: ${toEmail} with role: ${role}`,
			);
			const fromAddress = this.getFromAddress();
			const subject = `You have been granted ${role} access to a snippet`;
			const text = `You have been granted ${role} access to a snippet on Snipit.\n\nYou can access it here: ${pasteUrl}\nSnippet ID: ${pasteId}`;
			const html = EMAIL_TEMPLATES.ACCESS_GRANTED(
				role,
				pasteId,
				pasteUrl,
			);

			const response = await fetch(
				"https://api.brevo.com/v3/smtp/email",
				{
					method: "POST",
					headers: {
						accept: "application/json",
						"content-type": "application/json",
						"api-key": configurations.brevo.apiKey,
					},
					body: JSON.stringify({
						sender: {
							name: "Snipit",
							email: fromAddress,
						},
						to: [
							{
								email: toEmail,
							},
						],
						subject,
						textContent: text,
						htmlContent: html,
					}),
				},
			);

			if (!response.ok) {
				const errorData = (await response.json()) as {
					message?: string;
				};
				throw new Error(
					errorData.message || "Failed to send email via Brevo",
				);
			}

			const data = await response.json();
			logger.info(
				`Access granted email sent via Brevo to ${toEmail}: ${JSON.stringify(data)}`,
			);
		} catch (error) {
			logger.error(`Error sending email to ${toEmail} via Brevo:`, error);
		}
	}

	async sendVaultAccessGrantedEmail(
		toEmail: string,
		role: "viewer" | "editor" | "admin",
		collectionName: string,
		collectionUrl: string,
	) {
		try {
			logger.info(
				`Attempting to send vault access granted email via Brevo to: ${toEmail} with role: ${role}`,
			);
			const fromAddress = this.getFromAddress();
			const subject = `You have been granted ${role} access to a password vault`;
			const text = `You have been granted ${role} access to a password vault collection on Snipit.\n\nYou can access it here: ${collectionUrl}\nCollection: ${collectionName}`;
			const html = EMAIL_TEMPLATES.VAULT_ACCESS_GRANTED(
				role,
				collectionName,
				collectionUrl,
			);

			const response = await fetch(
				"https://api.brevo.com/v3/smtp/email",
				{
					method: "POST",
					headers: {
						accept: "application/json",
						"content-type": "application/json",
						"api-key": configurations.brevo.apiKey,
					},
					body: JSON.stringify({
						sender: {
							name: "Snipit Vault",
							email: fromAddress,
						},
						to: [
							{
								email: toEmail,
							},
						],
						subject,
						textContent: text,
						htmlContent: html,
					}),
				},
			);

			if (!response.ok) {
				const errorData = (await response.json()) as {
					message?: string;
				};
				throw new Error(
					errorData.message || "Failed to send email via Brevo",
				);
			}

			const data = await response.json();
			logger.info(
				`Vault access granted email sent via Brevo to ${toEmail}: ${JSON.stringify(data)}`,
			);
		} catch (error) {
			logger.error(`Error sending email to ${toEmail} via Brevo:`, error);
		}
	}

	async sendPasswordResetEmail(toEmail: string, resetUrl: string) {
		try {
			logger.info(
				`Attempting to send password reset email via Brevo to: ${toEmail}`,
			);
			const fromAddress = this.getFromAddress();
			const subject = "Password Reset Token";
			const text = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
			const html = EMAIL_TEMPLATES.PASSWORD_RESET(resetUrl);

			const response = await fetch(
				"https://api.brevo.com/v3/smtp/email",
				{
					method: "POST",
					headers: {
						accept: "application/json",
						"content-type": "application/json",
						"api-key": configurations.brevo.apiKey,
					},
					body: JSON.stringify({
						sender: {
							name: "Snipit",
							email: fromAddress,
						},
						to: [
							{
								email: toEmail,
							},
						],
						subject,
						textContent: text,
						htmlContent: html,
					}),
				},
			);

			if (!response.ok) {
				const errorData = (await response.json()) as {
					message?: string;
				};
				throw new Error(
					errorData.message ||
						"Failed to send password reset email via Brevo",
				);
			}

			const data = await response.json();
			logger.info(
				`Password reset email sent via Brevo to ${toEmail}: ${JSON.stringify(data)}`,
			);
		} catch (error) {
			logger.error(
				`Error sending password reset email to ${toEmail} via Brevo:`,
				error,
			);
		}
	}

	async sendLoginNotificationEmail(
		toEmail: string,
		username: string,
		userAgentHeader: string,
		ipAddress: string,
	) {
		try {
			logger.info(
				`Attempting to send login notification email via Brevo to: ${toEmail}`,
			);
			const fromAddress = this.getFromAddress();

			// Parse User Agent
			let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
			let browser = "Unknown Browser";
			let os = "Unknown OS";
			let deviceName = "Unknown Device";

			const ua = userAgentHeader || "";
			if (/ipad|tablet/i.test(ua)) {
				deviceType = "tablet";
				deviceName = "Tablet Device";
			} else if (/mobi|iphone|android/i.test(ua)) {
				deviceType = "mobile";
				deviceName = /iphone/i.test(ua)
					? "Apple iPhone"
					: "Android Smartphone";
			} else {
				deviceType = "desktop";
				deviceName = /macintosh|mac os x/i.test(ua)
					? "Apple Mac PC"
					: "Windows PC";
			}

			if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) {
				browser = "Google Chrome";
			} else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
				browser = "Apple Safari";
			} else if (/firefox|fxios/i.test(ua)) {
				browser = "Mozilla Firefox";
			} else if (/edge|edg/i.test(ua)) {
				browser = "Microsoft Edge";
			} else if (/opera|opr/i.test(ua)) {
				browser = "Opera";
			}

			if (/windows/i.test(ua)) {
				os = "Windows";
			} else if (/macintosh|mac os x/i.test(ua)) {
				os = "macOS";
			} else if (/iphone|ipad|ipod/i.test(ua)) {
				os = "iOS";
			} else if (/android/i.test(ua)) {
				os = "Android";
			} else if (/linux/i.test(ua)) {
				os = "Linux";
			}

			// Clean and resolve IP Location
			let location = "Unknown Location";
			const cleanIp =
				ipAddress === "::1" || ipAddress === "127.0.0.1"
					? "Localhost"
					: ipAddress;

			if (
				cleanIp !== "Localhost" &&
				!cleanIp.startsWith("192.168.") &&
				!cleanIp.startsWith("10.")
			) {
				try {
					const controller = new AbortController();
					const timeoutId = setTimeout(
						() => controller.abort(),
						1500,
					);

					const response = await fetch(
						`http://ip-api.com/json/${cleanIp}`,
						{
							signal: controller.signal,
						},
					);
					clearTimeout(timeoutId);

					if (response.ok) {
						const ipData = (await response.json()) as {
							city?: string;
							country?: string;
							status?: string;
						};
						if (ipData.status === "success") {
							location = `${ipData.city || "Unknown City"}, ${ipData.country || "Unknown Country"}`;
						}
					}
				} catch (err) {
					logger.warn(
						`Failed to resolve IP location for ${cleanIp}:`,
						err,
					);
				}
			} else {
				location = "Localhost Network";
			}

			const subject = `Security Alert: New login detected for Snipit`;
			const text = `New login detected for your Snipit account: ${username}\nDevice: ${deviceName} (${os} • ${browser})\nLocation: ${location}\nIP: ${cleanIp}`;

			// Build password reset/security url
			const resetUrl = `${configurations.domain}/reset-password`;
			const html = EMAIL_TEMPLATES.LOGIN_NOTIFICATION(
				username,
				deviceName,
				browser,
				os,
				cleanIp,
				location,
				deviceType,
				resetUrl,
			);

			const response = await fetch(
				"https://api.brevo.com/v3/smtp/email",
				{
					method: "POST",
					headers: {
						accept: "application/json",
						"content-type": "application/json",
						"api-key": configurations.brevo.apiKey,
					},
					body: JSON.stringify({
						sender: {
							name: "Snipit Security",
							email: fromAddress,
						},
						to: [
							{
								email: toEmail,
							},
						],
						subject,
						textContent: text,
						htmlContent: html,
					}),
				},
			);

			if (!response.ok) {
				const errorData = (await response.json()) as {
					message?: string;
				};
				throw new Error(
					errorData.message ||
						"Failed to send login notification email via Brevo",
				);
			}

			const data = await response.json();
			logger.info(
				`Login notification email sent via Brevo to ${toEmail}: ${JSON.stringify(data)}`,
			);
		} catch (error) {
			logger.error(
				`Error sending login notification email to ${toEmail}:`,
				error,
			);
		}
	}
}

export default EmailService;
