import Shop from "../models/Shop.model.js";
import Product from "../models/Product.model.js";

// 📝 1. เปิดร้านค้าใหม่
// 🔗 Route: POST /api/shops/
// 🛡️ Middleware: protectRoute (บังคับ login), uploadCloud.single("shopLogo") (อัปโหลดรูปโลโก้)
// 📥 รับค่า: req.body (shopName, shopDescription, shopBanner), req.file (รูป), req.user (ข้อมูล session คนสร้าง)
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

        // 3. 🌟 สร้างรหัสร้านค้า 6 หลักที่ไม่ซ้ำ (Random)
        let shopCode;
        let isUnique = false;
        while (!isUnique) {
            shopCode = Math.floor(100000 + Math.random() * 900000).toString(); // สุ่มเลข 6 หลัก
            const existingCode = await Shop.findOne({ shopCode });
            if (!existingCode) {
                isUnique = true; // ถ้าไม่มีซ้ำ ถือว่าผ่าน
            }
        }

        // 4. บันทึกข้อมูลร้านลงฐานข้อมูล
        const newShop = await Shop.create({
            ownerId: req.user._id, // เซ็ต owner ให้เป็นของ user ที่ยิง API มา
            shopName,
            shopCode, // รหัสสุ่มที่ได้
            shopDescription: shopDescription || "ยินดีต้อนรับสู่ร้านค้าของเรา",
            shopLogo: logoUrl, // บันทึก URL จาก Cloudinary
            shopBanner: shopBanner || ""
        });

        // 5. ตอบกลับ status 201 Created ส่งให้ Frontend
        res.status(201).json({ success: true, message: "เปิดร้านค้าสำเร็จ!", data: newShop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};
// 🔍 2. ดึงข้อมูลร้านค้าทั้งหมด (โชว์ที่หน้า Directory หาร้านค้า)
// 🔗 Route: GET /api/shops/
export const getAllShops = async (req, res) => {
    try {
        // หาเฉพาะร้านที่ยัง active (ไม่ถูกแบน/ปลิว)
        // populate เพื่อดึงชื่อและรูปโปรไฟล์ของเจ้าของร้านมาแสดงด้วย
        const shops = await Shop.find({ status: "active" })
            .populate("ownerId", "username imageProfile")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: shops.length, data: shops });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// 🏠 3. ดูข้อมูลหน้าร้าน (ใช้สำหรับหน้า ShopDetail)
// 🔗 Route: GET /api/shops/:id
// 📥 รับค่า: req.params.id
export const getShopById = async (req, res) => {
    try {
        // ดึงข้อมูลร้านตาม ID พร้อมข้อผู้ใช้เจ้าของร้าน
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

// ✏️ 4. แก้ไขข้อมูลร้านค้า (เปลี่ยนชื่อร้าน, โลโก้, รายละเอียด)
// 🔗 Route: PUT /api/shops/:id
// 🛡️ Middleware: protectRoute, uploadCloud.single("shopLogo")
// 📥 รับค่า: req.body (แก้ไขฟิลด์ไหนบ้าง), req.file (ถ้ารูปใหม่), req.user, req.params.id
export const updateShop = async (req, res) => {
    try {
        // 1. หาร้านที่ต้องการแก้ไข
        let shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: "ไม่พบร้านค้านี้" });

        // 2. 🛡️ เช็คสิทธิ์: คนส่ง request ต้องเป็นเจ้าของร้านนี้ (ถึงจะอนุญาตให้แก้)
        if (shop.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขร้านค้านี้" });
        }

        let updateData = { ...req.body };

        // 3. ถ้ามีการอัปโหลดรูปใหม่
        if (req.file) {
            updateData.shopLogo = req.file.path; // ใช้รูปใหม่จาก Cloudinary (ยังขาดส่วนลบรูปเก่าทิ้ง)
        }

        // 4. บันทึกข้อมูลที่แก้ไข
        // new: true ให้ส่งของที่อัปเดตคืนกลับไปที่ฝั่ง Frontend
        shop = await Shop.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, message: "อัปเดตข้อมูลร้านค้าสำเร็จ", data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// 🏠 5. ดึงข้อมูลร้านค้าของตัวเอง (ไว้ใช้บน Header ดูว่าเรามีร้านหรือยัง)
// 🔗 Route: GET /api/shops/my-shop
// 🛡️ Middleware: protectRoute
export const getMyShop = async (req, res) => {
    try {
        // หา Shop ที่เจ้าของ (ownerId) คือ user ที่ login อยู่ (_id ดึงจาก token ผ่าน protectRoute)
        const shop = await Shop.findOne({ ownerId: req.user._id });
        if (!shop) {
            // ถ้าไม่เจอ = ยังไม่มีร้าน แจ้งบอก Frontend ว่า 0 ไม่มีร้าน (hasShop: false)
            return res.status(200).json({ success: true, hasShop: false });
        }
        // ถ้าเจอ = ส่งข้อมูลร้าน ให้ Frontend (hasShop: true)
        res.status(200).json({ success: true, hasShop: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

// 🗑️ 6. ลบร้านค้า (เจ้าของหรือแอดมินเท่านั้น)
// 🔗 Route: DELETE /api/shops/:id
// 🛡️ Middleware: protectRoute
export const deleteShop = async (req, res) => {
    try {
        // หาร้านค้าที่ต้องการลบ
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: "ไม่พบร้านค้านี้" });

        // 🛡️ ตรวจสิทธิ์: ผู้ใช้ที่ Login ต้องเป็น "เจ้าของร้าน" หรือ "Role: admin"
        if (shop.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบร้านค้านี้" });
        }

        // 💣 ลบสินค้าทั้งหมดของร้านนี้ไปด้วยเลย จะได้ไม่เป็นการค้างในระบบ (deleteMany)
        // (ยังขาดการเข้าไปลบรูปทิ้งที่ Cloudinary)
        await Product.deleteMany({ shopId: req.params.id });

        // ลบร้านค้าออก
        await shop.deleteOne();
        
        res.status(200).json({ success: true, message: "ลบร้านค้าและสินค้าทั้งหมดเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};