import Trade from "../models/Trade.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

// 🤝 1. สร้างใบคำขอแลกของ (ยื่นข้อเสนอ)
// รับค่า: receiveId (ID ผู้รับ), offerItems (ของที่เราให้), requestedItems (ของที่เราอยากได้), message, etc.
// ทำงาน: ตรวจสอบความถูกต้อง -> สร้าง Trade Record -> ส่งแจ้งเตือน (Notification) ไปยังผู้รับ
export const createTrade = async (req, res) => {
    try {
        const { 
            receiveId, offerItems, requestedItems, message,
            offerMoney, requestedMoney, delivered, meetupLocation, expiredAt 
        } = req.body;
        
        const requestId = req.user._id;

        // ห้ามแลกกับตัวเอง (แอบเหงาเหรอ?)
        if (requestId.toString() === receiveId.toString()) {
            return res.status(400).json({ success: false, message: "ไม่สามารถยื่นข้อเสนอให้ตัวเองได้" });
        }

        // ตั้งค่าวันหมดอายุ (ถ้าไม่ส่งมา ให้ Default เป็น 3 วัน)
        let finalExpiredAt = expiredAt;
        if (!finalExpiredAt) {
            const today = new Date();
            today.setDate(today.getDate() + 3); 
            finalExpiredAt = today;
        }

        const newTrade = await Trade.create({
            requestId,
            receiveId,
            offerItems,    
            requestedItems,  
            message,
            offerMoney,
            requestedMoney,
            delivered,
            meetupLocation,
            expiredAt: finalExpiredAt
        });

        // 🔔 แจ้งเตือนเจ้าของสินค้าให้มาดูข้อเสนอ
        await Notification.create({
            receiver: receiveId,
            sender: requestId,
            type: "TRADE_REQUEST",
            message: `${req.user.username} ได้ส่งข้อเสนอขอเทรดสินค้าของคุณ!`,
            linkId: newTrade._id // ใส่ Link ID เพื่อให้กดจากแจ้งเตือนแล้วเด้งมาหน้านี้ได้ทันที
        });

        res.status(201).json({ success: true, message: "ส่งคำขอแลกเปลี่ยนสำเร็จ!", data: newTrade });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ==========================================
// 2. กล่องจดหมายขาเข้า (Inbox)
// ==========================================
export const getTradeRequests = async (req, res) => {
    try {
        const trades = await Trade.find({ receiveId: req.user._id })
            .populate("requestId", "username imageProfile")
            .populate("offerItems", "productName images")
            .populate("requestedItems", "productName images")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: trades.length, data: trades });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ==========================================
// 3. กล่องจดหมายขาออก (Outbox)
// ==========================================
export const getMyOffers = async (req, res) => {
    try {
        const trades = await Trade.find({ requestId: req.user._id })
            .populate("receiveId", "username imageProfile")
            .populate("offerItems", "productName images")
            .populate("requestedItems", "productName images")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: trades.length, data: trades });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ✅/❌ 4. ตัดสินใจ! ยอมรับ หรือ ปฏิเสธ (Respond to Trade)
// ทำงาน: อัปเดตสถานะใบเทรด -> ส่งแจ้งเตือนกลับ -> (ถ้าตกลง) อัปเดตสถานะของสินค้าเป็น TRADED
export const respondToTrade = async (req, res) => {
    try {
        const { status } = req.body; 
        const tradeId = req.params.id;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง" });
        }

        const trade = await Trade.findById(tradeId);
        if (!trade) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการแลกเปลี่ยน" });

        // ป้องกันคนอื่นมาแอบกดแทนเจ้าของ
        if (trade.receiveId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ตัดสินใจข้อเสนอนี้" });
        }

        trade.status = status;
        await trade.save();

        // 🔔 แจ้งเตือนกลับไปยังคนขอเทรดว่าผลเป็นยังไง
        await Notification.create({
            receiver: trade.requestId,
            sender: req.user._id,
            type: status === "ACCEPTED" ? "TRADE_ACCEPTED" : "TRADE_REJECTED",
            message: `${req.user.username} ได้ ${status === 'ACCEPTED' ? 'ยอมรับ' : 'ปฏิเสธ'} ข้อเสนอการเทรดของคุณแล้ว`,
            linkId: trade._id
        });

        // ถ้าตกลงแลกกัน ให้ล็อคสินค้าทั้งสองฝั่งไม่ให้คนอื่นมาซื้อ/แลกซ้ำ
        if (status === "ACCEPTED") {
            const allItemIds = [...trade.offerItems, ...trade.requestedItems];
            await Product.updateMany(
                { _id: { $in: allItemIds } },
                { $set: { status: "TRADED" } }
            );
        }

        res.status(200).json({ 
            success: true, 
            message: `คุณได้ ${status === 'ACCEPTED' ? 'ตกลง' : 'ปฏิเสธ'} การแลกเปลี่ยนแล้ว`, 
            data: trade 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ==========================================
// 5. ยกเลิกคำขอแลกของ (Cancel Trade)
// ==========================================
export const cancelTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการแลกเปลี่ยน" });

        if (trade.requestId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ยกเลิกข้อเสนอนี้" });
        }

        trade.status = "CANCELLED";
        await trade.save();

        res.status(200).json({ success: true, message: "ยกเลิกคำขอแลกเปลี่ยนแล้ว", data: trade });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ==========================================
// 6. ยืนยันการแลกเปลี่ยนสำเร็จ (Complete Trade)
// ==========================================
export const completeTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการแลกเปลี่ยน" });

        // ✅ อัปเกรดให้รองรับสถานะ SHIPPED ด้วย
        if (trade.status !== "ACCEPTED" && trade.status !== "SHIPPED") {
            return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง ไม่สามารถจบการเทรดได้" });
        }

        if (trade.requestId.toString() !== req.user._id.toString() && trade.receiveId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์จัดการข้อเสนอนี้" });
        }

        trade.status = "COMPLETED";
        await trade.save();

        // 🔔 แจ้งเตือนฝ่ายตรงข้ามว่าการเทรดเสร็จสิ้นแล้ว
        const otherPartyId = trade.requestId.toString() === req.user._id.toString() ? trade.receiveId : trade.requestId;
        await Notification.create({
            receiver: otherPartyId,
            sender: req.user._id,
            type: "TRADE_ACCEPTED", 
            message: `การแลกเปลี่ยนกับ ${req.user.username} เสร็จสมบูรณ์แล้ว! อย่าลืมไปให้คะแนนความพึงพอใจกันนะครับ`,
            linkId: trade._id
        });

        // อัปเดต stats เฉพาะคนที่กดปุ่ม Complete (ผู้ยื่นข้อเสนอ)
        await User.updateOne(
            { _id: req.user._id },
            { $inc: { tradeCount: 1, successfulTrade: 1 } }
        );

        res.status(200).json({ success: true, message: "การแลกเปลี่ยนเสร็จสมบูรณ์แล้ว", data: trade });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ==========================================
// 7. 🚚 อัปเดตสถานะการจัดส่งพัสดุ
// ==========================================
export const updateShipping = async (req, res) => {
    try {
        const { tradeId, trackingNumber, shippingCompany } = req.body;
        const trade = await Trade.findByIdAndUpdate(
            tradeId,
            { trackingNumber, shippingCompany, status: "SHIPPED" },
            { new: true }
        );

        // 🔔 เพิ่มระบบแจ้งเตือนว่าของส่งแล้ว!
        const otherPartyId = trade.requestId.toString() === req.user._id.toString() ? trade.receiveId : trade.requestId;
        await Notification.create({
            receiver: otherPartyId,
            sender: req.user._id,
            type: "TRADE_SHIPPED",
            message: `สินค้าของคุณถูกจัดส่งแล้ว! เลขพัสดุ: ${trackingNumber} (${shippingCompany})`,
            linkId: trade._id
        });

        res.status(200).json({ success: true, message: "อัปเดตสถานะจัดส่งสำเร็จ", data: trade });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};