import Community from "../models/Community.model.js";
import Notification from "../models/Notification.model.js";

// 📢 1. สร้างโพสต์ใหม่ (Create Post)
// รับค่า: content (ข้อความ), postType (ประเภท), images (ไฟล์จาก Multer), referencedProduct (ID สินค้า), tags
// ทำงาน: ดึง URL รูปจาก Cloudinary -> เซฟลง Community Model
export const createPost = async (req, res) => {
    try {
        const { content, postType, referencedProduct, tags } = req.body;

        // ดึง URL รูปภาพจาก Cloudinary ที่ Multer จัดการให้ (ส่งมาหลายรูปได้)
        let imageUrls = [];
        if (req.files) {
            imageUrls = req.files.map(file => file.path);
        }

        const newPost = await Community.create({
            author: req.user._id, // เจ้าของโพสต์
            content,
            images: imageUrls,
            postType: postType || "GENERAL",
            referencedProduct: referencedProduct ? JSON.parse(referencedProduct) : null,
            tags: tags ? JSON.parse(tags) : []
        });

        res.status(201).json({ success: true, message: "สร้างโพสต์สำเร็จ", data: newPost });
    } catch (error) {
        console.log(`create community post error : ${error}`);
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// 🌐 2. ดึงโพสต์ทั้งหมดมาโชว์หน้า Feed (Get All Posts)
// รับค่า (Query): postType (ประเภทโพสต์), search (คำค้นหา)
// ทำงาน: กรองโพสต์ที่ยังไม่ถูกลบ -> Populate ข้อมูลผู้ใช้/สินค้าอ้างอิง -> เรียงจากล่าสุด
export const getAllPosts = async (req, res) => {
    try {
        const { postType, search } = req.query;
        let query = { status: { $ne: "DELETED" } }; // ดึงมาหมดยกเว้นที่โดนลบ (Soft delete)

        if (postType) query.postType = postType;
        if (search) query.content = { $regex: search, $options: "i" }; // ค้นหาข้อความแบบ Case-insensitive

        const posts = await Community.find(query)
            .populate("author", "username imageProfile") // ดึงชื่อและรูปคนโพสต์
            .populate("referencedProduct", "productName price images") // ดึงข้อมูลสินค้าที่ถูกแท็ก
            .populate({
                path: "comments.user",
                select: "username imageProfile"
            })
            .sort({ createdAt: -1 }); // ล่าสุดขึ้นก่อน

        res.status(200).json({ success: true, count: posts.length, data: posts });
    } catch (error) {
        console.log(`get all community posts error : ${error}`);
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// 📖 3. (ฟีเจอร์ใหม่) ดึงโพสต์แบบเจาะจง 1 โพสต์ (ดูรายละเอียดและคอมเมนต์ทั้งหมด)
export const getPostById = async (req, res) => {
    try {
        const post = await Community.findById(req.params.id)
            .populate("author", "username imageProfile")
            .populate("referencedProduct", "productName price images")
            .populate("comments.user", "username imageProfile"); // ดึงรูป/ชื่อของคนคอมเมนต์มาด้วย

        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// ✏️ 4. (ฟีเจอร์ใหม่) แก้ไขโพสต์
export const updatePost = async (req, res) => {
    try {
        const { content, postType, tags, keepImages } = req.body;

        let post = await Community.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์" });

        // เช็คสิทธิ์ ต้องเป็นเจ้าของโพสต์เท่านั้นถึงแก้ได้
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขโพสต์นี้" });
        }

        // อัปเดตข้อมูลและเปลี่ยนสถานะเป็น EDITED
        post.content = content || post.content;
        if (postType) post.postType = postType;
        post.tags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : post.tags;
        post.status = "EDITED";

        // จัดการรูปภาพ:
        // keepImages = รูปเดิมที่ user ต้องการเก็บไว้ (เป็น JSON string array ของ URL)
        // req.files = รูปใหม่ที่ upload ขึ้น Cloudinary
        let finalImages = [];

        // เก็บรูปเดิมที่ user เลือกไว้
        if (keepImages) {
            const kept = typeof keepImages === 'string' ? JSON.parse(keepImages) : keepImages;
            finalImages = Array.isArray(kept) ? kept : [];
        }

        // เพิ่มรูปใหม่ที่ upload ขึ้น Cloudinary
        if (req.files && req.files.length > 0) {
            const newUrls = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newUrls];
        }

        // อัปเดตรูปเฉพาะเมื่อมีการส่งข้อมูลรูปมา (ไม่ว่าจะ keep หรือ upload ใหม่)
        if (keepImages !== undefined || (req.files && req.files.length > 0)) {
            post.images = finalImages;
        }

        await post.save();
        res.status(200).json({ success: true, message: "แก้ไขโพสต์สำเร็จ", data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// ❤️ 5. กดไลค์ / เลิกไลค์ (Like Post)
// ทำงาน: เช็คว่าเคยไลค์หรือยัง ถ้ายังให้ Push เข้าอาเรย์ ถ้าเคยแล้วให้ Pull ออก
export const likePost = async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });

        const userIdStr = req.user._id.toString();
        const isLiked = post.likes.some(id => id.toString() === userIdStr);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userIdStr);
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();

        // 🔔 สร้างแจ้งเตือนไปหาเจ้าของโพสต์ (ยกเว้นกดไลค์โพสต์ตัวเอง)
        if (!isLiked && post.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                receiver: post.author,
                sender: req.user._id,
                type: "NEW_LIKE",
                message: `${req.user.username || 'มีคน'} ถูกใจโพสต์ของคุณ`,
                linkId: post._id
            });
        }

        res.status(200).json({ success: true, message: isLiked ? "เลิกถูกใจแล้ว" : "ถูกใจโพสต์แล้ว", data: post.likes });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// 💬 6. คอมเมนต์โพสต์
export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: "กรุณาพิมพ์ข้อความคอมเมนต์" });

        const post = await Community.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });

        const newComment = {
            user: req.user._id,
            text: text
        };

        post.comments.push(newComment);
        await post.save();

        // 🔔 สร้างแจ้งเตือนถ้าคนคอมเมนต์ไม่ใช่เจ้าของโพสต์
        if (post.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                receiver: post.author,
                sender: req.user._id,
                type: "NEW_COMMENT",
                message: `${req.user.username || 'มีคน'} แสดงความคิดเห็นในโพสต์ของคุณ`,
                linkId: post._id
            });
        }

        // ดึงข้อมูล User ของคอมเมนต์ที่เพิ่งสร้างเพื่อให้แสดงชื่อ/รูปทันที
        const updatedPost = await Community.findById(post._id).populate({
            path: "comments.user",
            select: "username imageProfile"
        });

        res.status(201).json({ success: true, message: "คอมเมนต์สำเร็จ", data: updatedPost.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// ❌ 7. (ฟีเจอร์ใหม่) ลบคอมเมนต์
export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Community.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์" });

        // หาคอมเมนต์ที่ต้องการลบ
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "ไม่พบคอมเมนต์" });

        // เช็คสิทธิ์: คนเขียนคอมเมนต์, เจ้าของโพสต์, หรือแอดมิน ลบได้
        if (comment.user.toString() !== req.user._id.toString() &&
            post.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์ลบคอมเมนต์นี้" });
        }

        // เตะคอมเมนต์ออก
        post.comments.pull(commentId);
        await post.save();

        res.status(200).json({ success: true, message: "ลบคอมเมนต์สำเร็จ", data: post.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// 🗑️ 8. ลบโพสต์
export const deletePost = async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์" });

        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบโพสต์นี้" });
        }

        await post.deleteOne();
        res.status(200).json({ success: true, message: "ลบโพสต์เรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};