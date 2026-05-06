import express from "express";
import AuthController from "@/controllers/auth.controller.js";
import AuthService from "@/services/auth.service.js";
import EmailService from "@/services/email.service.js";
import { protect } from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import {
	registerSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	updateMeSchema,
} from "@/validators/auth.validators.js";
import { catchAsync } from "@/lib/errors.js";

const router: express.Router = express.Router();

const emailService = new EmailService();
const authService = new AuthService(emailService);
const authController = new AuthController(authService);

router.post(
	"/register",
	validate(registerSchema),
	catchAsync(authController.registerUser.bind(authController)),
);
router.post(
	"/login",
	validate(loginSchema),
	catchAsync(authController.loginUser.bind(authController)),
);
router.post(
	"/google",
	catchAsync(authController.googleLogin.bind(authController)),
);
router.post(
	"/logout",
	catchAsync(authController.logoutUser.bind(authController)),
);
router.get(
	"/me",
	protect,
	catchAsync(authController.getMe.bind(authController)),
);
router.put(
	"/me",
	protect,
	validate(updateMeSchema),
	catchAsync(authController.updateMe.bind(authController)),
);
router.post(
	"/forgotpassword",
	validate(forgotPasswordSchema),
	catchAsync(authController.forgotPassword.bind(authController)),
);
router.put(
	"/resetpassword/:token",
	validate(resetPasswordSchema),
	catchAsync(authController.resetPassword.bind(authController)),
);

export default router;
