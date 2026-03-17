import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 🔔 ผู้รับการแจ้งเตือน
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👤 ผู้กระทำ (เช่น คนที่มาไลค์/คอมเมนต์/ขอเทรด)
    type: { 
        type: String, 
        // 🏷️ ประเภทการแจ้งเตือนต่างๆ
        enum: ["TRADE_REQUEST", "TRADE_ACCEPTED", "TRADE_REJECTED", "TRADE_SHIPPED", "NEW_COMMENT", "NEW_LIKE", "NEW_FOLLOWER"], 
        required: true 
    },
    message: { type: String, required: true }, // ข้อความสั้นๆ ที่จะโชว์
    linkId: { type: mongoose.Schema.Types.ObjectId }, // 🔗 ID อ้างอิง (เช่น Post ID หรือ Trade ID) เพื่อให้กดแล้วเด้งไปถูกหน้า
    isRead: { type: Boolean, default: false } // อ่านแล้วยัง?
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;