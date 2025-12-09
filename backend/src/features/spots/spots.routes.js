import express from "express";
import { getAllSpots, getSpotById } from "./spots.controller.js";

const router = express.Router();

router.get("/", getAllSpots);
router.get("/:id", getSpotById);

export default router;
