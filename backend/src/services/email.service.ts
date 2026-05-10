import nodemailer from "nodemailer";
import configurations from "@/config/configurations.js";
import logger from "@/config/logger.js";
import { EMAIL_TEMPLATES } from "@/templates/email.templates.js";

class EmailService {
	private transporter = nodemailer.createTransport({
		service: configurations.smtp.service,
		host: configurations.smtp.host,
		port: configurations.smtp.port,
		secure: configurations.smtp.port === 465,
		auth: {
			user: configurations.smtp.user,
			pass: configurations.smtp.pass,
		},
	});

	private isVerified = false;
	private lastErrorMessage: string | null = null;
	private verificationPromise: Promise<boolean> | null = null;

	constructor() {
		// Verification will be triggered on demand by health checks
	}

	public getLastError(): string | null {
		return this.lastErrorMessage;
	}

	public async ensureVerification(): Promise<boolean> {
		if (this.isVerified) return true;
		if (this.verificationPromise) return this.verificationPromise;

		this.lastErrorMessage = null;
		this.verificationPromise = this.transporter
			.verify()
			.then(() => {
				this.isVerified = true;
				this.verificationPromise = null;
				this.lastErrorMessage = null;
				logger.info("✅ Email Service Verified and Ready");
				return true;
			})
			.catch((err) => {
				this.isVerified = false;
				this.verificationPromise = null;
				this.lastErrorMessage = err.message || "Unknown SMTP error";
				logger.error(
					"❌ Email Service Verification Failed:",
					this.lastErrorMessage,
				);
				return false;
			});

		return this.verificationPromise;
	}

	async verify() {
		return this.isVerified;
	}

	async sendAccessGrantedEmail(
		toEmail: string,
		role: "viewer" | "editor" | "commenter" | "admin",
		pasteId: string,
		pasteUrl: string,
	) {
		try {
			logger.info(
				`Attempting to send access granted email to: ${toEmail} with role: ${role}`,
			);
			const mailOptions = {
				from: configurations.smtp.from,
				to: toEmail,
				subject: `You have been granted ${role} access to a snippet`,
				text: `You have been granted ${role} access to a snippet on Snipit.\n\nYou can access it here: ${pasteUrl}\nSnippet ID: ${pasteId}`,
				html: EMAIL_TEMPLATES.ACCESS_GRANTED(role, pasteId, pasteUrl),
			};

			const info = await this.transporter.sendMail(mailOptions);
			logger.info(
				`Access granted email sent to ${toEmail}: ${info.messageId}`,
			);
		} catch (error) {
			logger.error(`Error sending email to ${toEmail}:`, error);
		}
	}

	async sendPasswordResetEmail(toEmail: string, resetUrl: string) {
		try {
			logger.info(
				`Attempting to send password reset email to: ${toEmail}`,
			);
			const mailOptions = {
				from: configurations.smtp.from,
				to: toEmail,
				subject: "Password Reset Token",
				text: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`,
				html: EMAIL_TEMPLATES.PASSWORD_RESET(resetUrl), // Using external template
			};

			const info = await this.transporter.sendMail(mailOptions);
			logger.info(
				`Password reset email sent to ${toEmail}: ${info.messageId}`,
			);
		} catch (error) {
			logger.error(
				`Error sending password reset email to ${toEmail}:`,
				error,
			);
		}
	}
}

export default EmailService;
