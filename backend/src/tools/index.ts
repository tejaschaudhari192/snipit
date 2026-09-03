import { Router } from "express";
import vaultRouter from "./password-manager/routes/vault.route.js";
import trainsRouter from "./trains/routes/trains.route.js";
import companionRouter from "./companion/routes/companion.route.js";

const toolsRouter: Router = Router();

toolsRouter.use("/password-manager/vault", vaultRouter);
toolsRouter.use("/trains", trainsRouter);
toolsRouter.use("/companion", companionRouter);

export default toolsRouter;
