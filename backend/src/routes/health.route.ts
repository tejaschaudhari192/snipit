import logger from "@/config/logger.js";
import {
	Router,
	type NextFunction,
	type Request,
	type Response,
} from "express";
const router: Router = Router();

router.get("/", (req, res) => {
	logger.info("Checking Server Status");
	return res.send("Hello");
});

export default router;
