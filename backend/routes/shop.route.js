import express from "express";
import { createShop, getAllShops, getShopById, updateShop, getMyShop, deleteShop } from "../controllers/shop.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { uploadCloud } from "../utils/cloudinary.js"; //

const router = express.Router();

router.get("/", getAllShops);
router.get("/my-shop", protectRoute, getMyShop);
router.get("/:id", getShopById);

// 🔒 ต้องล็อกอิน + แนบรูป "shopLogo" ให้ตรงกับหน้าบ้าน
router.post("/", protectRoute, uploadCloud.single("shopLogo"), createShop); //
router.put("/:id", protectRoute, uploadCloud.single("shopLogo"), updateShop); //
router.delete("/:id", protectRoute, deleteShop);

export default router;