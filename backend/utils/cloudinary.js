import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import "dotenv/config";

// 🟢 เชื่อมต่อ Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🟢 Storage สำหรับ Shop Logos, Profile Images
const storageGeneral = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "AppDevShopLogos",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// 🟢 Storage สำหรับ Product Images
const storageProducts = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "AppDevProducts",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

export const uploadCloud = multer({ storage: storageGeneral });
export const uploadProductCloud = multer({ storage: storageProducts });
export default cloudinary;