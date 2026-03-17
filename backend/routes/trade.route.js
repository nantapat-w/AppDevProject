import express from "express";
import { 
    createTrade, getTradeRequests, getMyOffers, 
    respondToTrade, cancelTrade, completeTrade, updateShipping 
} from "../controllers/trade.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; // ✅ แก้ชื่อให้ตรงกัน

const router = express.Router();

// 🤝 ระบบจัดการคำขอแลกเปลี่ยน (Trade)
router.post("/", protectRoute, createTrade); // ยื่นข้อเสนอขอแลกของ
router.get("/inbox", protectRoute, getTradeRequests); // ดูข้อเสนอที่คนอื่นส่งมาให้เรา (ขาเข้า)
router.get("/outbox", protectRoute, getMyOffers); // ดูข้อเสนอที่เราส่งไปหาคนอื่น (ขาออก)

router.put("/:id/respond", protectRoute, respondToTrade); // ตอบรับ/ปฏิเสธข้อเสนอ
router.put("/:id/cancel", protectRoute, cancelTrade); // ยกเลิกข้อเสนอที่เรายื่นไป
router.put("/:id/complete", protectRoute, completeTrade); // ยืนยันการแลกเปลี่ยนเสร็จสมบูรณ์
router.put("/shipping", protectRoute, updateShipping); // อัปเดตเลขพัสดุและบริษัทขนส่ง

export default router;