import { asyncHandler, successResponse } from "../../shared/utils.js";
import SpotsService from "./spots.service.js";

export const getAllSpots = asyncHandler(async (req, res) => {
  const { category, division, district } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (division) filter["location.division"] = division;
  if (district) filter["location.district"] = district;

  const spots = await SpotsService.findAll(filter);
  return res.json(successResponse(spots));
});

export const getSpotById = asyncHandler(async (req, res) => {
  const spot = await SpotsService.findById(req.params.id);
  return res.json(successResponse(spot));
});
