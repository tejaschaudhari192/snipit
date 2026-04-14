import logger from "@/config/logger.js";
import { Router } from "express";
const router: Router = Router();

router.get("/", (req, res) => {
	logger.info("Checking Server Status");
	return res.send("Hello");
});

export default router;
