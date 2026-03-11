import Chat from "../models/Chat.model.js";

// 📨 1. ส่งข้อความ (ถ้าไม่มีห้องแชทจะสร้างให้ใหม่อัตโนมัติ)
export const sendMessage = async (req, res) => {
    try {
        // 🟢 รับ chatType มาจากหน้าบ้านด้วย (ถ้าไม่ส่งมาให้ถือว่าเป็น GENERAL)
        const { receiverId, content, chatType = "GENERAL" } = req.body;
        const senderId = req.user._id;

        // 🟢 หาห้องแชทที่ตรงกับประเภทด้วย
        let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
            chatType: chatType 
        });

        // ถ้าไม่มีให้สร้างใหม่พร้อมกำหนดประเภท
        if (!chat) {
            chat = await Chat.create({
                participants: [senderId, receiverId],
                chatType: chatType
            });
        }
        // ... (ส่วนที่เหลือ push messages เหมือนเดิม)

        // ถ้ายังไม่เคยคุยกันเลย ให้สร้างห้องแชทใหม่
        if (!chat) {
            chat = await Chat.create({
                participants: [senderId, receiverId]
            });
        }

        // เพิ่มข้อความใหม่เข้าไป
        const newMessage = { sender: senderId, content };
        chat.messages.push(newMessage);
        chat.lastMessage = content;
        chat.lastMessageBy = senderId;

        await chat.save();

        res.status(200).json({ success: true, data: chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📥 2. ดึงรายการแชททั้งหมด (หน้า Inbox เหมือน IG)
export const getMyChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate("participants", "username imageProfile") // ดึงชื่อและรูปคู่สนทนา
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📖 3. ดึงข้อความในห้องแชทเฉพาะ (ดึงมาอ่านประวัติการคุย)
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