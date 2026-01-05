import Joi from "joi";

const locationShape = Joi.object({
  division: Joi.string().optional().allow(""),
  district: Joi.string().optional().allow(""),
  exactSpot: Joi.string().optional().allow(""),
});

export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  eventType: Joi.string().valid("festival", "tour").required(),
  itinerary: Joi.string().optional().allow(""),
  price: Joi.number().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  location: Joi.alternatives().try(locationShape, Joi.string()).optional(),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).optional(),
  eventType: Joi.string().valid("festival", "tour").optional(),
  itinerary: Joi.string().optional().allow(""),
  price: Joi.number().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  location: Joi.alternatives().try(locationShape, Joi.string()).optional(),
  status: Joi.string().valid("pending", "approved", "rejected", "canceled").optional(),
});

export const commentSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
});

export const registrationSchema = Joi.object({
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  contactNumber: Joi.string().min(6).max(30).required(),
  age: Joi.number().integer().min(1).max(120).required(),
  sex: Joi.string().valid("male", "female", "other").required(),
  peopleCount: Joi.number().integer().min(1).max(5).required(),
  nidNumber: Joi.string().min(4).max(50).required(),
  termsAccepted: Joi.boolean().valid(true).required(),
});
