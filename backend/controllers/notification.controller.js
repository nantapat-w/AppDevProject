import Notification from "../models/Notification.model.js";

// 🔔 1. ดึงการแจ้งเตือนทั้งหมดของฉัน (Get My Notifications)
// ทำงาน: ดึงข้อมูลการแจ้งเตือนที่ Receiver เป็นเรา -> ดึงข้อมูล Sender (ชื่อ/รูป) มาแสดงด้วย -> เรียงจากใหม่ไปเก่า (20 อันล่าสุด)
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .populate("sender", "username imageProfile")
            .sort({ createdAt: -1 })
            .limit(20); 

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 2. กดอ่านการแจ้งเตือนทั้งหมด
export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiver: req.user._id, isRead: false }, 
            { isRead: true }
        );
        res.status(200).json({ success: true, message: "อ่านแจ้งเตือนทั้งหมดแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🗑️ 3. ลบแจ้งเตือนที่เก่ามากๆ (Option)
export const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "ลบการแจ้งเตือนแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};