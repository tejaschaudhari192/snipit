import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";
import { EMAIL_TEMPLATES } from "@/templates/email.templates.js";
import { parseUserAgentDetails } from "@/utils/user-agent.util.js";
import type { PnrTicketSharedEmailData } from "@/templates/trains/pnr-ticket-shared.template.js";

interface SendBrevoEmailOptions {
	toEmail: string;
	toName?: string | undefined;
	senderName?: string | undefined;
	replyToEmail?: string | undefined;
	subject: string;
	htmlContent: string;
	textContent?: string | undefined;
	throwOnError?: boolean | undefined;
}

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

	/**
	 * Core dispatcher: executes HTTP POST to Brevo transactional email API
	 */
	private async sendViaBrevo(options: SendBrevoEmailOptions): Promise<void> {
		const {
			toEmail,
			toName,
			senderName = "Snipit",
			replyToEmail,
			subject,
			htmlContent,
			textContent,
			throwOnError = false,
		} = options;

		try {
			logger.info(
				`Attempting to send email via Brevo to: ${toEmail} | Subject: "${subject}"`,
			);
			const fromAddress = this.getFromAddress();

			const payload: Record<string, unknown> = {
				sender: {
					name: senderName,
					email: fromAddress,
				},
				to: [
					{
						email: toEmail,
						...(toName ? { name: toName } : {}),
					},
				],
				subject,
				htmlContent,
			};

			if (textContent) payload.textContent = textContent;
			if (replyToEmail) payload.replyTo = { email: replyToEmail };

			const response = await fetch(
				"https://api.brevo.com/v3/smtp/email",
				{
					method: "POST",
					headers: {
						accept: "application/json",
						"content-type": "application/json",
						"api-key": configurations.brevo.apiKey,
					},
					body: JSON.stringify(payload),
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

			logger.info(
				`Email successfully dispatched via Brevo to: ${toEmail}`,
			);
		} catch (error) {
			logger.error(`Error sending email to ${toEmail} via Brevo:`, error);
			if (throwOnError) throw error;
		}
	}

	async sendAccessGrantedEmail(
		toEmail: string,
		role: "viewer" | "editor" | "commenter" | "admin",
		pasteId: string,
		pasteUrl: string,
	) {
		const subject = `You have been granted ${role} access to a snippet`;
		const text = `You have been granted ${role} access to a snippet on Snipit.\n\nYou can access it here: ${pasteUrl}\nSnippet ID: ${pasteId}`;
		const html = EMAIL_TEMPLATES.ACCESS_GRANTED(role, pasteId, pasteUrl);

		await this.sendViaBrevo({
			toEmail,
			subject,
			htmlContent: html,
			textContent: text,
		});
	}

	async sendVaultAccessGrantedEmail(
		toEmail: string,
		role: "viewer" | "editor" | "admin",
		collectionName: string,
		collectionUrl: string,
	) {
		const subject = `You have been granted ${role} access to a vault collection`;
		const text = `You have been granted ${role} access to vault collection "${collectionName}" on Snipit.\n\nYou can access it here: ${collectionUrl}`;
		const html = EMAIL_TEMPLATES.VAULT_ACCESS_GRANTED(
			role,
			collectionName,
			collectionUrl,
		);

		await this.sendViaBrevo({
			toEmail,
			subject,
			htmlContent: html,
			textContent: text,
		});
	}

	async sendPasswordResetEmail(toEmail: string, resetUrl: string) {
		const subject = "Reset your Snipit password";
		const text = `Reset your Snipit password\n\nYou recently requested to reset your password. Click the link below to proceed:\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`;
		const html = EMAIL_TEMPLATES.PASSWORD_RESET(resetUrl);

		await this.sendViaBrevo({
			toEmail,
			subject,
			htmlContent: html,
			textContent: text,
		});
	}

	async sendLoginNotificationEmail(
		toEmail: string,
		username: string,
		userAgentHeader: string,
		ipAddress: string,
	) {
		const info = await parseUserAgentDetails(userAgentHeader, ipAddress);
		const subject = "Security Alert: New login detected for Snipit";
		const text = `New login detected for your Snipit account: ${username}\nDevice: ${info.deviceName} (${info.os} • ${info.browser})\nLocation: ${info.location}\nIP: ${info.cleanIp}`;

		const resetUrl = `${configurations.domain}/reset-password`;
		const html = EMAIL_TEMPLATES.LOGIN_NOTIFICATION(
			username,
			info.deviceName,
			info.browser,
			info.os,
			info.cleanIp,
			info.location,
			info.deviceType,
			resetUrl,
		);

		await this.sendViaBrevo({
			toEmail,
			subject,
			htmlContent: html,
			textContent: text,
		});
	}

	async sendFeedbackEmail(
		adminEmail: string,
		type: string,
		title: string,
		description: string,
		userEmail: string,
	) {
		const subject = `[Snipit Feedback] ${type.toUpperCase()}: ${title}`;
		const text = `New Feedback Received\n\nType: ${type}\nFrom: ${userEmail}\n\nTitle: ${title}\nDescription: ${description}`;
		const html = EMAIL_TEMPLATES.FEEDBACK_RECEIVED(
			type,
			title,
			description,
			userEmail,
		);

		await this.sendViaBrevo({
			toEmail: adminEmail,
			toName: "Snipit Admin",
			senderName: "Snipit Feedback",
			replyToEmail: userEmail || undefined,
			subject,
			htmlContent: html,
			textContent: text,
		});
	}

	async sendPnrStatusUpdateEmail(
		toEmail: string,
		details: {
			pnr: string;
			trainName: string;
			trainNumber: string;
			from: string;
			to: string;
			departureDate?: string;
			changes: string[];
			isConfirmed?: boolean;
			isChartPrepared?: boolean;
			pnrUrl: string;
		},
	) {
		const subject = details.isConfirmed
			? `🎉 PNR Confirmed: ${details.trainName} (#${details.trainNumber})`
			: details.isChartPrepared
				? `📋 Chart Prepared: PNR ${details.pnr} (${details.trainName})`
				: `🔔 PNR Status Update: ${details.trainName} (PNR: ${details.pnr})`;

		const text = `PNR Status Update for ${details.pnr} (${details.trainName} #${details.trainNumber})\n\nChanges:\n${details.changes.map((c) => `- ${c}`).join("\n")}\n\nView live status: ${details.pnrUrl}`;
		const html = EMAIL_TEMPLATES.PNR_STATUS_UPDATE(details);

		await this.sendViaBrevo({
			toEmail,
			senderName: "Snipit Trains",
			subject,
			htmlContent: html,
			textContent: text,
		});
	}

	async sendPnrTicketShareEmail(
		toEmail: string,
		details: PnrTicketSharedEmailData,
	) {
		const subject = `🎟️ Train Ticket: ${details.trainName} (PNR: ${details.pnr})`;
		const text = `Train Ticket Shared for PNR ${details.pnr} (${details.trainName} #${details.trainNumber})\n\nRoute: ${details.from} to ${details.to}\nDeparture: ${details.departureDate || ""} ${details.departureTime || ""}\n\nView live status: ${details.pnrUrl}`;
		const html = EMAIL_TEMPLATES.PNR_TICKET_SHARED(details);

		await this.sendViaBrevo({
			toEmail,
			senderName: "Snipit Trains",
			subject,
			htmlContent: html,
			textContent: text,
			throwOnError: true,
		});
	}
}

export default EmailService;
