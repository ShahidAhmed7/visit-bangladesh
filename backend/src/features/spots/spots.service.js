import TouristSpot from "../../models/TouristSpot.js";
import { NotFoundError } from "../../shared/errors.js";

class SpotsService {
  async findAll(filter = {}) {
    return TouristSpot.find(filter).lean();
  }

  async findById(id) {
    const spot = await TouristSpot.findById(id).lean();
    if (!spot) throw new NotFoundError("Spot");
    return spot;
  }
}

export default new SpotsService();
