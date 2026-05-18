import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";
import { EMAIL_TEMPLATES } from "@/templates/email.templates.js";

class EmailService {
	private isVerified = true;
	private lastErrorMessage: string | null = null;

	constructor() {
		logger.info(
			"✨ Brevo Transactional Email Service Active (HTTP-based Delivery)",
		);
	}

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
}

export default EmailService;
