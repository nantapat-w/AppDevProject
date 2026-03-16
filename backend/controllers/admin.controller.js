import User from "../models/User.model.js";
import Shop from "../models/Shop.model.js";
import Product from "../models/Product.model.js";
import Community from "../models/Community.model.js";
import Order from "../models/Order.model.js";
import Trade from "../models/Trade.model.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user status (active, suspended, banned)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" });
        }

        user.accountStatus = status;
        await user.save();

        res.status(200).json({ success: true, message: "อัปเดตสถานะผู้ใช้งานสำเร็จ", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "ลบผู้ใช้งานสำเร็จ" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserByAdmin = async (req, res) => {
    try {
        const { username, email, role, accountStatus } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (accountStatus) user.accountStatus = accountStatus;

        await user.save();
        res.status(200).json({ success: true, message: "อัปเดตข้อมูลผู้ใช้งานสำเร็จ", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Clear all content data (shops, products, posts, orders, trades)
// @route   DELETE /api/admin/clear-data
// @access  Private/Admin
export const clearAllData = async (req, res) => {
    try {
        const [shops, products, community, orders, trades] = await Promise.all([
            Shop.deleteMany({}),
            Product.deleteMany({}),
            Community.deleteMany({}),
            Order.deleteMany({}),
            Trade.deleteMany({}),
        ]);

        res.status(200).json({
            success: true,
            message: "ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว",
            deleted: {
                shops: shops.deletedCount,
                products: products.deletedCount,
                communityPosts: community.deletedCount,
                orders: orders.deletedCount,
                trades: trades.deletedCount,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
