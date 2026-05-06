import { z } from "zod";

export const registerSchema = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(6),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email(),
});

export const resetPasswordSchema = z.object({
	password: z.string().min(6),
});

export const updateMeSchema = z.object({
	username: z.string().min(3).max(30).optional(),
});
