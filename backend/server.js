import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import path from "path"; // 🟢 สำหรับอ่านไฟล์รูปภาพ
import fs from "fs"; // 🌟 เพิ่ม fs สำหรับอ่านและเขียนไฟล์ .txt

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
import orderRoute from "./routes/order.routes.js";
import adminRoute from "./routes/admin.route.js";
import { getSiteSettings } from "./controllers/siteSettings.controller.js";
import { initializeSettings } from "./models/SiteSettings.model.js";


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
app.use("/api/orders", orderRoute);
app.use("/api/admin", adminRoute);
app.get("/api/settings", getSiteSettings);

// =================================================================
// 🌟 🌟 เพิ่ม API สำหรับจัดการไฟล์ BannerContent.txt (สำหรับหน้า Admin) 🌟 🌟
// =================================================================

// 📍 กำหนด Path ไปที่โฟลเดอร์ assets ของ Frontend
// หมายเหตุ: ตรง "../frontend" ให้เช็คว่าโฟลเดอร์ React ของคุณชื่อนี้ไหม ถ้าชื่อ "client" ก็เปลี่ยนเป็น "../client/src/assets/..."
const bannerFilePath = path.join(process.cwd(), "../frontend/src/assets/BannerContent.txt");

// 1. API สำหรับเซฟเนื้อหาลงไฟล์ .txt
app.post('/api/admin/save-banner-file', async (req, res) => {
    try {
        const { content } = req.body;
        // เขียนไฟล์ทับของเดิมด้วยเนื้อหาใหม่
        fs.writeFileSync(bannerFilePath, content || '', 'utf8');
        res.json({ success: true, message: 'บันทึกลงไฟล์ .txt สำเร็จ' });
    } catch (error) {
        console.error("Error writing file:", error);
        res.status(500).json({ success: false, message: 'เซฟไฟล์ไม่สำเร็จ: ' + error.message });
    }
});

// 2. API สำหรับอ่านเนื้อหาจากไฟล์ .txt ไปโชว์หน้าเว็บ
app.get('/api/get-banner-file', (req, res) => {
    try {
        if (fs.existsSync(bannerFilePath)) {
            const content = fs.readFileSync(bannerFilePath, 'utf8');
            res.json({ success: true, data: content });
        } else {
            res.json({ success: true, data: 'ยังไม่มีรายละเอียดโปรโมชั่น (ไม่พบไฟล์)' });
        }
    } catch (error) {
        console.error("Error reading file:", error);
        res.status(500).json({ success: false, message: 'อ่านไฟล์ไม่สำเร็จ' });
    }
});
// =================================================================


// 🚀 สตาร์ทเซิร์ฟเวอร์ และต่อ Database
app.listen(PORT, async () => {
    await connectDB();
    await initializeSettings();
    console.log(`Server is running on http://localhost:${PORT}`);
});