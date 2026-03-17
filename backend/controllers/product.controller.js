import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import cloudinary from "../utils/cloudinary.js";

// ระบบสร้างสินค้าสำหรับลงขาย หรือ เทรด
// 🔗 Route: POST /api/products/
// 🛡️ Middleware: protectRoute (ต้อง login), uploadCloud.single("image")
// 📥 รับค่า: req.body (รายละเอียดสินค้า), req.file (รูปภาพ), req.user (ข้อมูลคนที่ login)
export const createProduct = async(req,res) => {
    try{
        // 1. รับค่าที่ส่งมาจาก Frontend ผ่าน form-data
        const { 
            productName, productDescription, category, 
            condition, tradeType, price, wishlist, 
            tags, shopId 
        } = req.body;

        // 2. 🟢 Cloudinary: req.file.path คือ URL เต็มที่ได้จาก Cloudinary โดยตรง
        let imageUrls = [];
        if (req.file) {
            imageUrls.push(req.file.path);
        }

        // 3. บันทึกข้อมูลสินค้าลง Database
        const newProduct = await Product.create({
            ownerId: req.user._id, // ดึง ObjectId ของคนที่เรียก API นี้
            shopId: shopId,        // ผูกรหัสร้านที่ส่งมาจาก Frontend
            productName,
            productDescription,
            category,
            condition,
            tradeType,
            price,
            wishlist,
            images: imageUrls, // 🟢 เอารูปลง Database ตรงนี้!
            tags
        });

        // 4. ตอบกลับ Frontend ว่าบรรลุเป้าหมาย
        res.status(201).json({success:true , message:"ลงประกาศสินค้าสำเร็จ" , data:newProduct});

    }catch(error){
        console.log(`create product controller error : ${error}`);
        res.status(500).json({success:false , message:`Server Error : ${error}`});
    }
}

// ระบบกรองค้นหาข้อมูลสินค้า (สำหรับหน้าหลัก หรือ หน้าค้นหา)
// 🔗 Route: GET /api/products/
// 📥 รับค่า: req.query (category, search)
export const getAllProducts = async(req,res) => {
    try{
        // 1. รับค่าที่ใช้กรองผ่าน query parameters (เช่น ?category=electronics&search=phone)
        const {category , search} = req.query;

        // 2. ดึงเฉพาะสินค้าที่ 'AVAILABLE' เท่านั้น
        let query = {status:"AVAILABLE"};

        // 3. เพิ่มเงื่อนไขการค้นหาถ้ามี
        if (category) query.category = category;
        if (search) query.productName = { $regex: search, $options: "i" }; // ค้นหาบางส่วนและไม่สนตัวพิมพ์ใหญ่เล็ก

        // 4. ดึงข้อมูลจาก MongoDB พร้อมกับ populate 
        // populate = แอบไปเอา username, imageProfile จากตาราง User มาเสียบไว้จะได้ไม่ต้อง query สองรอบ
        const products = await Product.find(query)
            .populate("ownerId", "username imageProfile") // ✅ แก้เป็น imageProfile ตาม Model
            .sort({ createdAt: -1 }); // เรียงล่าสุดขึ้นก่อน

        res.status(200).json({ success: true, count: products.length, data: products });
    }catch(error){
        console.log(`get all products controller error : ${error}`);
        res.status(500).json({success:false , message:`Server Error : ${error}` , data:products});
    }
}

// ระบบแสดงรายละเอียดสินค้า (โชว์ที่หน้า ProductDetail)
// 🔗 Route: GET /api/products/:id
// 📥 รับค่า: req.params.id (ObjectId ของ product)
export const getProductById = async (req,res) => {
    try{
        // 1. หา product + นับ views ไปเลยในตัว (findByIdAndUpdate)
        // new: true = คือให้ส่งคืน product เวอร์ชันใหม่หลังอัปเดตไปกลับไป
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {$inc:{views:1}}, // เพิ่มยอดดูขึ้นทีละ 1 
            {new:true}
        ).populate("ownerId" , "username email imageProfile") // ดึงข้อมูลเจ้าของด้วยว่าชื่อและเมลอะไร
         .populate("shopId", "shopName shopLogo rating");     // ดึงข้อมูลร้านเผื่อว่ามาจากร้าน เพื่อแสดงหน้า Detail ด้วย

        if (!product) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสินค้านี้" });
        }

        // 2. ถ้ามีร้านค้า (shopId ถูกแปะมาอยู่) ให้นับสินค้าทั้งหมดของร้านนั้นด้วยเพื่อโชว์ "สินค้าทั้งหมด X ชิ้น"
        let shopProductCount = null;
        if (product.shopId) {
            shopProductCount = await Product.countDocuments({ 
                shopId: product.shopId._id, 
                status: "AVAILABLE" 
            });
        }

        // 3. ตอบกลับข้อมูล product และ จำนวน count สำหรับร้านนี้
        res.status(200).json({ success: true, data: product, shopProductCount });
    }catch(error){
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: "รูปแบบ ID ไม่ถูกต้อง" });
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
    }
}

// ระบบดูคลังสินค้าของเรา (ยังไม่ได้ใช้ในไฟล์นี้แต่มีเตรียมไว้สำหรับหน้า Profile)
// 🔗 Route: GET /api/products/my-products
// 🛡️ Middleware: protectRoute
export const getMyProducts = async(req,res) => {
    try{
        // ค้นหาสินค้าที่ ownerId ตรงกับเรา (ที่ login อยู่)
        const myProducts = await Product.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: myProducts.length, data: myProducts });
    }catch(error){
        console.log(`getMyProducts controller error : ${error}`);
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
}

// ระบบเปลี่ยนแปลงรายละเอียดสินค้า
// 🔗 Route: PUT /api/products/:id
// 🛡️ Middleware: protectRoute, uploadCloud.single("image")
// 📥 รับค่า: req.params.id, req.body (ข้อมูลใหม่), req.file (รูปใหม่ถ้ามี)
export const updateProduct = async(req,res) => {
    try{
        // 1. ตรวจสอบว่ามีสินค้านี้อยู่จริงไหม
        let product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({success : false , message : "ไม่พบข้อมูลสินค้า"});
        }

        // 2. 🛡️ ตรวจว่าผู้ที่สั่งอัปเดตเป็นเจ้าของหรือเปล่า? (กันโดนของคนอื่น)
        if (product.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขสินค้านี้" });
        }

        // 3. 🟢 จัดการเรื่องรูปภาพ (ถ้ามีการเปลี่ยน)
        let updateData = { ...req.body };
        
        if (req.file) {
            // 3.1 ลบรูปเก่าออกจาก Cloudinary ก่อน (ถ้ามี)
            if (product.images && product.images.length > 0) {
                for (const imgUrl of product.images) {
                    // ดึง public_id จาก Cloudinary URL (ส่วน path ก่อน .ext) เพื่อไว้ลบที่ Cloudinary
                    const parts = imgUrl.split('/');
                    const filename = parts[parts.length - 1];
                    const folder = parts[parts.length - 2];
                    const publicId = `${folder}/${filename.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId).catch(() => {}); // ลบ (ถ้า error ก็ข้ามได้)
                }
            }
            // 3.2 ใส่รูปใหม่ (URL จาก Cloudinary) เตรียมบันทึกกลับลง Database
            updateData.images = [req.file.path];
        }

        // 4. สั่ง update เลย (new: true = ส่ง product ที่อัปเดตใหม่กลับมา)
        product = await Product.findByIdAndUpdate(req.params.id, updateData,
            { new: true, 
              runValidators: true 
            });

        res.status(200).json({ success: true, message: "แก้ไขข้อมูลสำเร็จ!", data: product });

    }catch(error){
        console.log(`updatecontroller error : ${error}`);
        res.status(500).json({success:false,message : `Server Error : ${error}`});
    }
}

// ระบบการลบข้อมูลสินค้า
// 🔗 Route: DELETE /api/products/:id
// 🛡️ Middleware: protectRoute
// 📥 รับค่า: req.params.id (สินค้าที่จะลบ)
export const deleteProduct = async (req, res) => {
    try {
        // 1. ตามหาเป้าหมายที่ต้องการลบ
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสินค้า" });

        // 2. 🛡️ ด่านตรวจความปลอดภัย: ใครสั่งลบ? (ต้องเป็นเจ้าของ หรือ admin เท่านั้น)
        if (product.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบสินค้านี้" });
        }

        // 3. 🗑️ ลบรูปออกจาก Cloudinary ก่อนลบด้วย (ถ้ามีรูปผูกอยู่ จะได้ไม่เปลืองพื้นที่ Cloudinary)
        if (product.images && product.images.length > 0) {
            for (const imgUrl of product.images) {
                const parts = imgUrl.split('/');
                const filename = parts[parts.length - 1];
                const folder = parts[parts.length - 2];
                const publicId = `${folder}/${filename.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId).catch(() => {});
            }
        }

        // 4. สั่งประหาร! (ลบทิ้งออกจาก Database จริงๆ แล้วทีนี้)
        await product.deleteOne();

        // 5. ส่งข้อความยืนยันการลบให้ Frontend โชว์ Alert
        res.status(200).json({ success: true, message: "ลบสินค้าเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

// ✅ ระบบพิเศษ: ดึงสินค้าทั้งหมดของร้านค้านั้นๆ (ใช้โชว์ที่หน้า Shop Detail)
// 🔗 Route: GET /api/products/shop/:shopId
// 📥 รับค่า: req.params.shopId
export const getProductsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        // ดึงเฉพาะที่ shopId ตรง และต้องเป็นเครื่องที่ 'AVAILABLE'
        // และเอา ownerId (คนสร้าง) ติดมาเผื่อด้วยผ่าน populate
        const products = await Product.find({ shopId: shopId, status: "AVAILABLE" })
            .populate("ownerId", "username imageProfile")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.log(`getProductsByShop error : ${error}`);
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
}