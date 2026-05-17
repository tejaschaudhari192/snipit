import express from "express";
import * as musicController from "@/controllers/music.controller.js";

const router: express.Router = express.Router();

router.get("/playlist", musicController.getPlaylist);
router.get("/search", musicController.searchTracks);

export default router;
