import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  createPost, getAllPosts, getPostById, updatePost,
  likePost, commentOnPost, deleteComment, deletePost  // ตรวจสอบชื่อฟังก์ชันใน controller ให้ตรงกัน
} from "../controllers/community.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// --- ตั้งค่า Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "community_posts",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage: storage });

// --- Routes ---
router.get("/", getAllPosts);
router.get("/:id", getPostById);

router.post("/", protectRoute, upload.array("images", 4), createPost); // ใช้ upload ตรงนี้
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

router.put("/:id/like", protectRoute, likePost);
router.post("/:id/comment", protectRoute, commentOnPost);
router.delete("/:postId/comment/:commentId", protectRoute, deleteComment);

export default router;