import User from "@/models/User.js";
import bcrypt from "bcryptjs";
import nodeCrypto from "crypto";
import type EmailService from "./email.service.js";
import configurations from "@/config/configurations.js";
import { OAuth2Client } from "google-auth-library";
import type { RegisterUserData, LoginCredentials } from "@/types/index.js";

class AuthService {
	private googleClient: OAuth2Client;

	constructor(private readonly emailService: EmailService) {
		this.googleClient = new OAuth2Client(configurations.google_client_id);
	}

	async registerUser(userData: RegisterUserData) {
		const { username, email, password } = userData;
		const userExists = await User.findOne({ email });
		if (userExists) throw new Error("USER_ALREADY_EXISTS");

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return await User.create({
			username,
			email,
			password: hashedPassword,
		});
	}

	async loginUser(credentials: LoginCredentials) {
		const { email, password } = credentials;
		const user = await User.findOne({ email });
		if (user && (await bcrypt.compare(password, user.password as string))) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user.toObject();
			return userWithoutPassword;
		}
		throw new Error("INVALID_CREDENTIALS");
	}

	async forgotPassword(email: string) {
		const user = await User.findOne({ email });
		if (!user) throw new Error("USER_NOT_FOUND");

		const resetToken = nodeCrypto.randomBytes(20).toString("hex");
		user.resetPasswordToken = nodeCrypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");
		user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

		await user.save();

		const frontendUrl = configurations.domain;
		const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

		try {
			await this.emailService.sendPasswordResetEmail(
				user.email,
				resetUrl,
			);
		} catch (err) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
			await user.save();
			throw new Error("EMAIL_COULD_NOT_BE_SENT", { cause: err });
		}
	}

	async resetPassword(token: string, password: string) {
		const resetPasswordToken = nodeCrypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) throw new Error("INVALID_TOKEN");

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		return await user.save();
	}

	async googleLogin(idToken: string) {
		const ticket = await this.googleClient.verifyIdToken({
			idToken,
			audience: configurations.google_client_id as string,
		});

		const payload = ticket.getPayload();
		if (!payload) throw new Error("INVALID_ID_TOKEN");

		const { sub: googleId, email, name } = payload;
		if (!email) throw new Error("EMAIL_NOT_PROVIDED");

		let user = await User.findOne({ $or: [{ googleId }, { email }] });

		if (!user) {
			let username =
				name?.replace(/\s+/g, "").toLowerCase() || email.split("@")[0];
			const existingUsername = await User.findOne({ username });
			if (existingUsername) {
				username = `${username}${Math.floor(Math.random() * 1000)}`;
			}
			user = await User.create({ username, email, googleId });
		} else if (!user.googleId) {
			user.googleId = googleId;
			await user.save();
		}

		return user;
	}
}

export default AuthService;
