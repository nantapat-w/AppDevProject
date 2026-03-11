import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    // เก็บ ID ของคน 2 คนที่คุยกัน
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    chatType: { 
        type: String, 
        enum: ["GENERAL", "TRADE"], 
        default: "GENERAL" 
    },
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            isRead: { type: Boolean, default: false }
        }
    ],
    lastMessage: { type: String },
    lastMessageBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;