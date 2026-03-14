import Coupon from "../models/Coupon.model.js";

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code, isActive: true });

        if (!coupon) return res.status(404).json({ success: false, message: "ไม่พบคูปองนี้" });
        if (new Date() > coupon.expiryDate) return res.status(400).json({ success: false, message: "คูปองหมดอายุแล้ว" });
        if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: "คูปองสิทธิ์เต็มแล้ว" });

        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minAmount, expiryDate, usageLimit } = req.body;
        const exists = await Coupon.findOne({ code });
        if (exists) return res.status(400).json({ success: false, message: "โค้ดคูปองนี้มีอยู่แล้ว" });

        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            minAmount,
            expiryDate,
            usageLimit
        });

        res.status(201).json({ success: true, message: "สร้างคูปองสำเร็จ", data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) return res.status(404).json({ success: false, message: "ไม่พบคูปอง" });
        res.status(200).json({ success: true, message: "ลบคูปองสำเสร็จ" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};