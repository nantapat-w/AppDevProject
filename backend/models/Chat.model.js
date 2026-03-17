import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    // 👥 เก็บ ID ของคน 2 คนที่คุยกัน (Array ของ User ID)
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    // 💬 ประเภทแชท (ทั่วไป หรือ เกี่ยวกับการเทรด)
    chatType: { 
        type: String, 
        enum: ["GENERAL", "TRADE"], 
        default: "GENERAL" 
    },
    // 📝 รายการข้อความในแชทนี้
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // คนส่ง
            content: { type: String, required: true }, // เนื้อหาข้อความ
            createdAt: { type: Date, default: Date.now }, // เวลาส่ง
            isRead: { type: Boolean, default: false } // อ่านหรือยัง
        }
    ],
    lastMessage: { type: String }, // ข้อความล่าสุด (เอาไว้โชว์ในหน้าลิสต์แชท)
    lastMessageBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // ใครส่งข้อความล่าสุดคนนั้น
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;