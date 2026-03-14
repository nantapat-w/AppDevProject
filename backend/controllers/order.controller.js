import Order from "../models/Order.model.js";

// Generate a random 18-character alphanumeric ID
const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 18; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount, paymentMethod } = req.body;
        const userId = req.user._id; // Assuming user is available from auth middleware

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "ไม่มีสินค้าในคำสั่งซื้อ" });
        }

        if (!shippingAddress) {
            return res.status(400).json({ success: false, message: "กรุณาระบุที่อยู่จัดส่ง" });
        }

        const orderId = generateOrderId();

        const newOrder = new Order({
            orderId,
            userId,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod,
            status: "PAID" // Defaulting to PAID as it's called after payment success
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "สร้างคำสั่งซื้อสำเร็จ",
            order: newOrder
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ" });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" });
    }
};
