import express from "express";
import { 
    createProduct, getAllProducts, getProductById, 
    getMyProducts, updateProduct, deleteProduct, getProductsByShop 
} from "../controllers/product.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { uploadProductCloud } from "../utils/cloudinary.js"; // 🟢 ใช้ Cloudinary (AppDevProducts folder)

const router = express.Router();

// 🔓 ไม่ต้องล็อกอิน
router.get("/", getAllProducts);
router.get("/shop/:shopId", getProductsByShop); 
router.get("/user/my-products", protectRoute, getMyProducts); 

router.get("/:id", getProductById); 

// 🔒 ต้องล็อกอิน
router.post("/", protectRoute, uploadProductCloud.single("image"), createProduct);
router.put("/:id", protectRoute, uploadProductCloud.single("image"), updateProduct);
router.delete("/:id", protectRoute, deleteProduct);

export default router;