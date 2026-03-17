import express from "express";
import { 
    register, login, logout, getMe, updateProfile, 
    updatePassword, addAddress, deleteAddress, 
    getUserProfile, forgotPassword, resetPassword,
    verifyEmail, refreshToken, toggleFollow,
    getFriends, deleteAccount // 🟢 เติมชื่อน้องคนนี้เข้าไปในลิสต์ import ด้วยครับ!
} from "../controllers/auth.controller.js";
import { uploadCloud } from "../utils/cloudinary.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// 🔓 Public Routes (ไม่ต้องเข้าสู่ระบบ)
router.post("/register", register); // สมัครสมาชิก
router.post("/login", login); // เข้าสู่ระบบ
router.post("/refresh-token", refreshToken); // ต่ออายุ Token
router.post("/forgot-password", forgotPassword); // ลืมรหัสผ่าน (ส่งเมล์)
router.put("/reset-password/:token", resetPassword); // รีเซ็ทรหัสผ่านใหม่
router.get("/profile/:id", getUserProfile); // ดูโปรไฟล์คนอื่น (ID)
// 🔒 Protected Routes (ต้องเข้าสู่ระบบ - ผ่าน middleware protectRoute)
router.get("/me", protectRoute, getMe); // ดึงข้อมูลตัวเอง
// อัปเดตโปรไฟล์ (รองรับการอัปโหลดรูปภาพ 1 รูป เข้า Cloudinary)
router.put("/profile", protectRoute, uploadCloud.single("imageProfile"), updateProfile);
router.put("/password", protectRoute, updatePassword); // เปลี่ยนรหัสผ่าน
router.post("/address", protectRoute, addAddress); // เพิ่มที่อยู่จัดส่ง
router.delete("/address/:addressId", protectRoute, deleteAddress); // ลบที่อยู่
router.delete("/account", protectRoute, deleteAccount); // 🗑️ ลบบัญชีผู้ใช้งาน
router.get("/friends", protectRoute, getFriends); // ดึงรายชื่อเพื่อน (Mutual Follow)
router.put("/verify-email", protectRoute, verifyEmail); // ยืนยันอีเมล

// 👥 ระบบ Social
router.put("/follow/:id", protectRoute, toggleFollow); 

// 🚪 ออกจากระบบ
router.post("/logout", logout); 

export default router;