import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(120).optional(),
  phone: Joi.string().optional(),
  bio: Joi.string().max(500).optional(),
  avatarUrl: Joi.string().uri().optional(),
  location: Joi.object({
    city: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),
});
