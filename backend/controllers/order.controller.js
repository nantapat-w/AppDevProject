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
        const { items, shippingAddress, totalAmount, originalAmount, discountCode, discountAmount, shopName, shopId, paymentMethod } = req.body;
        const userId = req.user._id;

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
            originalAmount: originalAmount || totalAmount,
            discountCode: discountCode || "",
            discountAmount: discountAmount || 0,
            shopName: shopName || "Shopify Store",
            shopId: shopId,
            paymentMethod,
            status: "PAID"
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

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "ไม่พบคำสั่งซื้อ" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดคำสั่งซื้อ" });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "ไม่พบคำสั่งซื้อ" });
        }

        // Only allow cancellation if order is in PENDING or PAID state
        const cancellableStates = ["PENDING", "PAID"];
        if (!cancellableStates.includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `ไม่สามารถยกเลิกคำสั่งซื้อได้ เนื่องจากอยู่ในสถานะ ${order.status}` 
            });
        }

        order.status = "CANCELLED";
        await order.save();

        res.status(200).json({ 
            success: true, 
            message: "ยกเลิกคำสั่งซื้อสำเร็จ",
            order 
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ" });
    }
};
