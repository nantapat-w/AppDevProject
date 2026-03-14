import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import Shop from "../models/Shop.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountStatus } = req.body;

        if (!["active", "suspended", "banned"].includes(accountStatus)) {
            return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง" });
        }

        const user = await User.findByIdAndUpdate(id, { accountStatus }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" });

        res.status(200).json({ success: true, message: `อัปเดตสถานะเป็น ${accountStatus} สำเร็จ`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find user first
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" });

        // Optionally delete associated data
        await Promise.all([
            Product.deleteMany({ ownerId: id }),
            Shop.deleteMany({ ownerId: id }),
            User.findByIdAndDelete(id)
        ]);

        res.status(200).json({ success: true, message: "ลบผู้ใช้งานและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
