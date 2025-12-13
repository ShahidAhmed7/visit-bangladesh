import { v2 as cloudinary } from "cloudinary";

// CLOUDINARY_URL expected in environment: cloudinary://<api_key>:<api_secret>@<cloud_name>
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export default cloudinary;
