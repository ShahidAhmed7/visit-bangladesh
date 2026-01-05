import Joi from "joi";

export const applyGuideSchema = Joi.object({
  experienceText: Joi.string().trim().min(1).required(),
  yearsOfExperience: Joi.number().min(0),
  languages: Joi.array().items(Joi.string().trim()),
  regions: Joi.array().items(Joi.string().trim()),
  specialties: Joi.array().items(Joi.string().trim()),
  cv: Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().trim().required(),
    originalFilename: Joi.string().trim(),
    bytes: Joi.number().min(0),
    format: Joi.string().trim(),
  }).optional(),
});

export const adminReviewSchema = Joi.object({
  adminNotes: Joi.string().trim().allow(null, ""),
});
