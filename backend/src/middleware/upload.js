import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "visit-bangladesh",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

export const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "visit-bangladesh/cv",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

export const uploadCv = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const attachImages = (req, _res, next) => {
  const incoming = req.body.images;
  let images = [];
  if (Array.isArray(incoming)) images = incoming;
  else if (incoming) images = [incoming];
  if (req.file?.path) images.push(req.file.path);
  if (images.length) req.body.images = images;
  else delete req.body.images;
  next();
};
