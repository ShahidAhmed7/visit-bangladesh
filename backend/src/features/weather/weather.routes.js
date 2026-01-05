import express from "express";
import { getCurrentWeather, suggestPlaces } from "./weather.controller.js";

const router = express.Router();

router.get("/suggest", suggestPlaces);
router.get("/current", getCurrentWeather);

export default router;
