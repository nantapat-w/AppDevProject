import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import path from "path"; // 🟢 สำหรับอ่านไฟล์รูปภาพ

// ✅ นำเข้า Database
import { connectDB } from "./utils/db.js"; 

// 📦 นำเข้า Routes ครบทุกฟีเจอร์ (ร้านค้าเพื่อนจะกลับมาตรงนี้แหละ!)
import authRoute from "./routes/auth.route.js"; 
import productRoute from "./routes/product.route.js";
import tradeRoute from "./routes/trade.route.js"; 
import communityRoute from "./routes/community.route.js";
import shopRoute from "./routes/shop.route.js"; // 🌟 พระเอกของเรา
import chatRoutes from "./routes/chat.route.js"; 
import notificationRoute from "./routes/notification.route.js";
import reviewRoute from "./routes/review.route.js"; 
import couponRoute from "./routes/coupon.route.js"; 
import accountSettingRoute from "./routes/accountsetting.route.js";
import adminRoute from "./routes/admin.route.js";
import settingsRoute from "./routes/settings.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Middlewares
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// 🟢 อนุญาตให้หน้าเว็บดึงรูปภาพจากโฟลเดอร์ uploads ได้
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🛣️ Routes เปิดใช้งานครบทุกเส้นทาง
app.use("/api/auth", authRoute);  
app.use("/api/products", productRoute);
app.use("/api/trades", tradeRoute);
app.use("/api/community", communityRoute);
app.use("/api/shops", shopRoute); // 🌟 เปิดประตูร้านค้า
app.use("/api/notifications", notificationRoute);
app.use("/api/chats", chatRoutes); 
app.use("/api/reviews", reviewRoute); 
app.use("/api/coupons", couponRoute); 
app.use("/api/account-settings", accountSettingRoute);
app.use("/api/admin", adminRoute);
app.use("/api/settings", settingsRoute);

// 🚀 สตาร์ทเซิร์ฟเวอร์ และต่อ Database
app.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on http://localhost:${PORT}`);
});