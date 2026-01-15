import express from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	getMe,
	updateMe,
} from "@/controllers/auth.controller.js";
import { protect } from "@/middleware/auth.middleware.js";

const router: express.Router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

export default router;
