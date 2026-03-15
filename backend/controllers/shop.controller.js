import Shop from "../models/Shop.model.js";

// 📝 1. เปิดร้านค้าใหม่
export const createShop = async (req, res) => {
    try {
        const { shopName, shopDescription, shopBanner } = req.body;

        // เช็คว่ามีร้านอยู่แล้วไหม
        const existingShop = await Shop.findOne({ ownerId: req.user._id });
        if (existingShop) {
            return res.status(400).json({ success: false, message: "คุณมีร้านค้าอยู่แล้ว" });
        }

        // เช็คชื่อร้านซ้ำ
        const nameTaken = await Shop.findOne({ shopName });
        if (nameTaken) {
            return res.status(400).json({ success: false, message: "ชื่อร้านนี้ถูกใช้งานแล้ว" });
        }

        // 🌟 ดึง URL ของรูปจาก Cloudinary
        let logoUrl = "";
        if (req.file) {
            logoUrl = req.file.path;
        }

        // 🌟 สร้างรหัสร้านค้า 6 หลักที่ไม่ซ้ำ
        let shopCode;
        let isUnique = false;
        while (!isUnique) {
            shopCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 หลัก
            const existingCode = await Shop.findOne({ shopCode });
            if (!existingCode) {
                isUnique = true;
            }
        }

        const newShop = await Shop.create({
            ownerId: req.user._id,
            shopName,
            shopCode, // บันทึกรหัสร้านค้า 6 หลัก
            shopDescription: shopDescription || "ยินดีต้อนรับสู่ร้านค้าของเรา",
            shopLogo: logoUrl, // บันทึก URL ลง MongoDB
            shopBanner: shopBanner || ""
        });

        res.status(201).json({ success: true, message: "เปิดร้านค้าสำเร็จ!", data: newShop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};
// 🔍 2. ดึงข้อมูลร้านค้าทั้งหมด
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find({ status: "active" })
            .populate("ownerId", "username imageProfile")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: shops.length, data: shops });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// 🏠 3. ดูข้อมูลหน้าร้าน
export const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
            .populate("ownerId", "username imageProfile trustScore email");

        if (!shop) {
            return res.status(404).json({ success: false, message: "ไม่พบร้านค้านี้" });
        }
        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// ✏️ 4. แก้ไขข้อมูลร้านค้า
export const updateShop = async (req, res) => {
    try {
        let shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: "ไม่พบร้านค้านี้" });

        if (shop.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขร้านค้านี้" });
        }

        let updateData = { ...req.body };

        // ถ้ามีการอัปโหลดรูปใหม่
        if (req.file) {
            updateData.shopLogo = req.file.path;
        }

        shop = await Shop.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, message: "อัปเดตข้อมูลร้านค้าสำเร็จ", data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// 🏠 5. ดึงข้อมูลร้านค้าของตัวเอง
export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user._id });
        if (!shop) {
            return res.status(200).json({ success: true, hasShop: false });
        }
        res.status(200).json({ success: true, hasShop: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// 🗑️ 6. ลบร้านค้า (เฉพาะเจ้าของร้าน)
export const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: "ไม่พบร้านค้านี้" });

        if (shop.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบร้านค้านี้" });
        }

        await Shop.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "ลบร้านค้าเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};