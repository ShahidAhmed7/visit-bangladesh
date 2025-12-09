import Joi from "joi";

export const createBlogSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  images: Joi.array().items(Joi.string()).max(10).optional(),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(10).optional(),
  images: Joi.array().items(Joi.string()).max(10).optional(),
});

export const addCommentSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
});
