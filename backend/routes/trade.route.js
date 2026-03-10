import express from "express";
import { 
    createTrade, getTradeRequests, getMyOffers, 
    respondToTrade, cancelTrade, completeTrade, updateShipping 
} from "../controllers/trade.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; // ✅ แก้ชื่อให้ตรงกัน

const router = express.Router();

router.post("/", protectRoute, createTrade); 
router.get("/inbox", protectRoute, getTradeRequests); 
router.get("/outbox", protectRoute, getMyOffers); 

router.put("/:id/respond", protectRoute, respondToTrade); 
router.put("/:id/cancel", protectRoute, cancelTrade); 
router.put("/:id/complete", protectRoute, completeTrade); 
router.put("/shipping", protectRoute, updateShipping); // ✅ เพิ่มเส้นทางกรอกเลขพัสดุให้แล้วครับ!

export default router;