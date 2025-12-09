import TouristSpot from "../models/TouristSpot.js";

export const getAllSpots = async (req, res, next) => {
  try {
    const { category, division, district } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (division) filter["location.division"] = division;
    if (district) filter["location.district"] = district;

    const spots = await TouristSpot.find(filter).lean();
    return res.json(spots);
  } catch (err) {
    return next(err);
  }
};

export const getSpotById = async (req, res, next) => {
  try {
    const spot = await TouristSpot.findById(req.params.id).lean();
    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }
    return res.json(spot);
  } catch (err) {
    return next(err);
  }
};
