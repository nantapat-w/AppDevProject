import express from "express";
import { sendMessage, getMyChats, getMessages } from "../controllers/chat.controller.js";
// ✅ เปลี่ยนชื่อจาก verifyToken เป็น protectRoute
import { protectRoute } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// ✅ เปลี่ยน verifyToken เป็น protectRoute ให้หมด
router.post("/send", protectRoute, sendMessage); 
router.get("/inbox", protectRoute, getMyChats); 
router.get("/:chatId", protectRoute, getMessages); 

export default router;