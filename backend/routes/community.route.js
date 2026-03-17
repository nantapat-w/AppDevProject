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

// --- Routes (จัดการข้อมูลชุมชน) ---
router.get("/", getAllPosts); // ดึงโพสต์ทั้งหมด (Public Feed)
router.get("/:id", getPostById); // ดูรายละเอียดโพสต์เจาะจง (Public)

// 🔒 Protected Routes (ต้องเข้าสู่ระบบ)
// สร้างโพสต์ (รองรับรูปภาพหลายรูป - สูงสุด 4 รูป)
router.post("/", protectRoute, upload.array("images", 4), createPost); 
// แก้ไขโพสต์ (รองรับการเปลี่ยนรูปภาพ)
router.put("/:id", protectRoute, upload.array("images", 4), updatePost);
router.delete("/:id", protectRoute, deletePost); // ลบโพสต์

router.put("/:id/like", protectRoute, likePost); // ถูกใจ/เลิกถูกใจ
router.post("/:id/comment", protectRoute, commentOnPost); // คอมเมนต์โพสต์
router.delete("/:postId/comment/:commentId", protectRoute, deleteComment); // ลบคอมเมนต์

export default router;