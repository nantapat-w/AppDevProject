import express from "express";
import { createShop, getAllShops, getShopById, updateShop, getMyShop, deleteShop } from "../controllers/shop.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { uploadCloud } from "../utils/cloudinary.js"; //

const router = express.Router();

// 🌐 เส้นทางสำหรับจัดการร้านค้า
router.get("/", getAllShops); // ดึงร้านค้าทั้งหมด (Public)
router.get("/my-shop", protectRoute, getMyShop); // ดึงข้อมูลร้านตัวเอง (ต้องล็อกอิน)
router.get("/:id", getShopById); // ดูข้อมูลร้านค้าเจาะจง (Public)

// 🔒 เส้นทางที่ต้องล็อกอิน (Protected)
// สร้างร้านค้าใหม่ (รองรับรูป Logo 1 รูป)
router.post("/", protectRoute, uploadCloud.single("shopLogo"), createShop); 
// แก้ไขข้อมูลร้านค้า
router.put("/:id", protectRoute, uploadCloud.single("shopLogo"), updateShop); 
// ลบร้านค้า
router.delete("/:id", protectRoute, deleteShop); 

export default router;