import express from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	getMe,
	updateMe,
	forgotPassword,
	resetPassword,
	googleLogin,
} from "@/controllers/auth.controller.js";
import { protect } from "@/middleware/auth.middleware.js";

const router: express.Router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);

export default router;
