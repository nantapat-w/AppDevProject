import Community from "../models/Community.model.js";

// 📢 1. สร้างโพสต์ใหม่
export const createPost = async (req, res) => {
    try {
        const { content, postType, referencedProduct, tags } = req.body;//ลบ imageออกเพื่อให้backend รับรูปโดยตรง
        
        // ดึง URL รูปภาพจาก Cloudinary ที่ Multer จัดการให้
        let imageUrls = [];
        if (req.files) {
            imageUrls = req.files.map(file => file.path); 
        }

        const newPost = await Community.create({
            author: req.user._id,
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

// 🌐 2. ดึงโพสต์ทั้งหมดมาโชว์หน้า Feed
export const getAllPosts = async (req, res) => {
    try {
        const { postType, search } = req.query;
        let query = { status: { $ne: "DELETED" } }; // ดึงมาหมดที่ไม่ใช่โดนลบไปแล้ว

        if (postType) query.postType = postType;
        if (search) query.content = { $regex: search, $options: "i" };

        const posts = await Community.find(query)
            .populate("author", "username imageProfile") // ✅ แก้เป็น imageProfile แล้ว
            .populate("referencedProduct", "productName price images")
            .sort({ createdAt: -1 });

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
        const { content, images, tags } = req.body;
        
        let post = await Community.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์" });

        // เช็คสิทธิ์ ต้องเป็นเจ้าของโพสต์เท่านั้นถึงแก้ได้
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขโพสต์นี้" });
        }

        // อัปเดตข้อมูลและเปลี่ยนสถานะเป็น EDITED
        post.content = content || post.content;
        post.images = images || post.images;
        post.tags = tags || post.tags;
        post.status = "EDITED";

        await post.save();
        res.status(200).json({ success: true, message: "แก้ไขโพสต์สำเร็จ", data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// ❤️ 5. กดไลค์ / เลิกไลค์
export const likePost = async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });

        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();
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

        res.status(201).json({ success: true, message: "คอมเมนต์สำเร็จ", data: post.comments });
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