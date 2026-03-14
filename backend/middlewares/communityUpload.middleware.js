import multer from "multer";
import path from "path";
import fs from "fs";

// สร้างโฟลเดอร์ uploads/community ถ้ายังไม่มี
const communityUploadPath = path.join(process.cwd(), "uploads", "community");
if (!fs.existsSync(communityUploadPath)) {
    fs.mkdirSync(communityUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/community/"); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

export const communityUpload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
