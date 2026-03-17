import express from "express";
import { getMyNotifications, markAsRead, deleteNotification } from "../controllers/notification.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; // ใช้ตัวที่คุณเพิ่งแก้ไป

const router = express.Router();

// 🔔 ระบบแจ้งเตือน (Notifications)
router.get("/", protectRoute, getMyNotifications); // ดึงการแจ้งเตือน 20 อันล่าสุด
router.put("/mark-read", protectRoute, markAsRead); // เปลี่ยนสถานะแจ้งเตือนเป็นอ่านแล้วทั้งหมด
router.delete("/:id", protectRoute, deleteNotification); // ลบการแจ้งเตือน

export default router;