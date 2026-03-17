import express from "express";
import { 
    createProduct, getAllProducts, getProductById, 
    getMyProducts, updateProduct, deleteProduct, getProductsByShop 
} from "../controllers/product.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { uploadProductCloud } from "../utils/cloudinary.js"; // 🟢 ใช้ Cloudinary (AppDevProducts folder)

const router = express.Router();

// 🔓 Public Routes (ไม่ต้องล็อกอิน)
router.get("/", getAllProducts); // ดึงสินค้าทั้งหมด (รองรับ Query: category, search)
router.get("/shop/:shopId", getProductsByShop); // ดึงสินค้าประจำร้านค้า
router.get("/:id", getProductById); // ดึงข้อมูลสินค้าเจาะจงหลัก (ID)

// 🆔 เส้นทางสำหรับดึงสินค้าของตัวเอง (Protected)
router.get("/user/my-products", protectRoute, getMyProducts); 

// 🔒 Protected Routes (ต้องล็อกอิน - ผ่าน middleware protectRoute)
// สร้างสินค้าใหม่ (รองรับการอัปโหลดรูปภาพ 1 รูป เข้า Cloudinary Folder: AppDevProducts)
router.post("/", protectRoute, uploadProductCloud.single("image"), createProduct);
// แก้ไขข้อมูลสินค้า
router.put("/:id", protectRoute, uploadProductCloud.single("image"), updateProduct);
// ลบสินค้า
router.delete("/:id", protectRoute, deleteProduct);

export default router;