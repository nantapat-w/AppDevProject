import express from "express";
import { createShop, getAllShops, getShopById, updateShop } from "../controllers/shop.controller.js";
// ✅ 1. เปลี่ยนชื่อจาก verifyToken เป็น protectRoute
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔓 ไม่ต้องล็อกอินก็ดูร้านคนอื่นได้
router.get("/", getAllShops);
router.get("/:id", getShopById);

// 🔒 ต้องล็อกอินถึงจะเปิดร้านหรือแก้ไขร้านตัวเองได้
// ✅ 2. เปลี่ยน verifyToken เป็น protectRoute
router.post("/", protectRoute, createShop);
router.put("/:id", protectRoute, updateShop);

export default router;