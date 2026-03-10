import express from "express";
import { 
    createPost, getAllPosts, getPostById, updatePost, 
    likePost, commentOnPost, deleteComment, deletePost 
} from "../controllers/community.controller.js";
// ✅ 1. เปลี่ยนชื่อจาก verifyToken เป็น protectRoute
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔓 ไม่ต้องล็อกอิน (ส่องฟีดได้)
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// 🔒 ต้องล็อกอิน (ถึงจะตั้งกระทู้ ไลค์ คอมเมนต์ได้)
// ✅ 2. เปลี่ยน verifyToken เป็น protectRoute ให้หมดเลยครับ
router.post("/", protectRoute, createPost);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

router.put("/:id/like", protectRoute, likePost);
router.post("/:id/comment", protectRoute, commentOnPost);
router.delete("/:postId/comment/:commentId", protectRoute, deleteComment);

export default router;