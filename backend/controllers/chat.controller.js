import Chat from "../models/Chat.model.js";

// 📨 1. ส่งข้อความ (Send Message)
// รับค่า: receiverId (ID ผู้รับ), content (ข้อความ), chatType (ประเภทแชท)
// ทำงาน: หาห้องแชทเดิม (ถ้ามี) ถ้าไม่มีให้สร้างใหม่ -> เพิ่มข้อความลงใน Array -> อัปเดตข้อความล่าสุด
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, chatType = "GENERAL" } = req.body;
        // ดึง Sender ID จาก Middleware (req.user)
        const senderId = req.user.id || req.user._id; 

        if (!receiverId || !content) {
            return res.status(400).json({ success: false, message: "กรุณาระบุผู้รับและข้อความ" });
        }

        // ค้นหาห้องแชทที่มีผู้ร่วม (participants) เป็นเรากับเขา และประเภทแชทตรงกัน
        let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
            chatType: chatType 
        });

        // ถ้ายังไม่เคยคุยกันมาก่อน ให้สร้างห้องแชทใหม่
        if (!chat) {
            chat = await Chat.create({
                participants: [senderId, receiverId],
                chatType: chatType,
                messages: [] 
            });
        }

        // สร้าง Object ข้อความใหม่
        const newMessage = { sender: senderId, content };
        chat.messages.push(newMessage);
        chat.lastMessage = content; // เก็บเอาไว้โชว์ในหน้าพรีวิวแชท
        chat.lastMessageBy = senderId;

        await chat.save();

        res.status(200).json({ success: true, data: chat });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📥 2. ดึงรายการแชททั้งหมด
export const getMyChats = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const chats = await Chat.find({ participants: userId })
            .populate("participants", "username imageProfile")
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📖 3. ดึงข้อความในห้องแชท
export const getMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate("participants", "username imageProfile")
            .populate("messages.sender", "username imageProfile");

        if (!chat) return res.status(404).json({ success: false, message: "ไม่พบห้องแชท" });

        res.status(200).json({ success: true, data: chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};