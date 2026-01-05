import { asyncHandler, successResponse } from "../../shared/utils.js";
import SpotsService from "./spots.service.js";

// GET /api/spots
export const getAllSpots = asyncHandler(async (req, res) => {
  const {
    q,
    categories,
    division,
    district,
    minRating,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  // eslint-disable-next-line no-console
  console.log('getAllSpots query ->', req.query);

  const result = await SpotsService.search({
    q,
    categories,
    division,
    district,
    minRating,
    sort,
    page,
    limit,
  });

  // Return the requested response shape with data + meta
  return res.json({
    status: "success",
    data: result.data,
    meta: result.meta,
  });
});

export const getSpotById = asyncHandler(async (req, res) => {
  const spot = await SpotsService.findById(req.params.id);
  return res.json(successResponse(spot));
});
