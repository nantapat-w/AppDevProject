import express from "express";
import { sendMessage, getMyChats, getMessages } from "../controllers/chat.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// 🟢 ปรับให้ตรงกับ Frontend ที่เรียกใช้
// 💬 ระบบแชท (Real-time Chat Support)
router.post("/", protectRoute, sendMessage);  // ส่งข้อความใหม่/สร้างห้องแชท
router.get("/", protectRoute, getMyChats);     // ดึงรายการห้องแชททั้งหมดที่เราคุยอยู่
router.get("/:chatId", protectRoute, getMessages); // ดึงข้อความในห้องแชทเจาะจง

export default router;