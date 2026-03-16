import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import redis from "../utils/redis.js";
import sendEmail from "../utils/sendEmail.js"; // 📧 อย่าลืม import ตัวส่งเมลที่นายน้อยทำไว้นะครับ!

// 🔑 1. ฟังก์ชันสร้าง Token
export const generateToken = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// 📝 2. ระบบสมัครสมาชิก
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "สมัครสมาชิกสำเร็จ",
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};
// 🚪 3. ระบบ Login (ฉบับสมบูรณ์)
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        }).select('+password');

        if (!user) return res.status(404).json({ success: false, message: "ไม่พบบัญชีผู้ใช้งาน" });

        if (user.accountStatus === "suspended" || user.accountStatus === "banned") {
            return res.status(403).json({ success: false, message: "บัญชีของคุณถูกระงับ" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });

        user.lastLogin = Date.now();
        await user.save();

        const { accessToken, refreshToken } = generateToken(user);
        await redis.set(`session:${user._id}`, refreshToken, "EX", 604800);

        // ✅ ตั้งค่า Cookie ให้รองรับทั้ง Localhost และ Production (HTTPS)
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // ต้องเป็น true ใน production (HTTPS)
            sameSite: isProduction ? "none" : "lax", // none สำหรับ cross-origin ใน production
        };

        res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(200).json({
            success: true,
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ... (ส่วนที่เหลือ getMe, logout, etc. เหมือนเดิมได้เลย) ...
// 👤 4. ดึงข้อมูลตัวเอง
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server Error : ${error.message}` });
    }
};

// 🚪 5. ระบบออกจากระบบ
export const logout = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        // 🛡️ ล้างข้อมูลใน Redis (ถ้ามี Token)
        if (accessToken) {
            await redis.set(`blacklist:${accessToken}`, "true", "EX", 900);
        }

        // ดึง userId จาก token โดยตรงเพื่อความชัวร์ (กรณี protectRoute ไม่ทำงาน)
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_TOKEN);
                await redis.del(`session:${decoded.id}`);
            } catch (err) {
                // ถ้า token เน่าก็ข้ามไป
            }
        }

        // ✅ สั่งลบ Cookie ใน Browser ทันที (ต้องใส่ options ให้เหมือนตอนสร้าง)
        const isProduction = process.env.NODE_ENV === "production";
        const clearOptions = { 
            httpOnly: true, 
            secure: isProduction, 
            sameSite: isProduction ? "none" : "lax" 
        };
        res.clearCookie("accessToken", clearOptions);
        res.clearCookie("refreshToken", clearOptions);

        return res.status(200).json({ success: true, message: "ออกจากระบบเรียบร้อยแล้ว" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔄 6. ระบบต่ออายุ Token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "ไม่พบ Refresh Token" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_TOKEN);

        const storedToken = await redis.get(`session:${decoded.id}`);
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({ message: "เซสชั่นหมดอายุหรือถูกบังคับออกจากระบบ" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

        const tokens = generateToken(user);

        // ✅ Set accessToken cookie ใหม่ให้ browser
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 15 * 60 * 1000, // 15 นาที
        };
        res.cookie("accessToken", tokens.accessToken, cookieOptions);

        res.status(200).json({
            success: true,
            message: "ต่ออายุเซสชั่นสำเร็จ"
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Refresh Token หมดอายุหรือผิดพลาด" });
    }
};

// 🛠️ 7. อัปเดตโปรไฟล์
export const updateProfile = async (req, res) => {
    try {
        const { phoneNumber, gender, birthday, bio } = req.body;
        let updateData = {};

        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (gender !== undefined) updateData.gender = gender;
        if (birthday !== undefined) updateData.birthday = birthday;
        if (bio !== undefined) updateData.bio = bio;
        if (req.file) {
            updateData.imageProfile = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "อัปเดตโปรไฟล์สำเร็จ", data: updatedUser });
    } catch (error) {
        // ดึง validation error message จาก Mongoose ออกมาให้ชัดเจน
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔐 8. เปลี่ยนรหัสผ่าน
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "รหัสผ่านเดิมไม่ถูกต้อง" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📍 9. จัดการที่อยู่ (เพิ่มส่วนนี้เข้าไป Server จะหาย Crash ทันที)
export const addAddress = async (req, res) => {
    try {
        const { label, addressLine, province, zipCode, isDefault } = req.body;
        const user = await User.findById(req.user._id);
        if (isDefault) user.address.forEach(addr => addr.isDefault = false);
        user.address.push({ label, addressLine, province, zipCode, isDefault: isDefault || false });
        await user.save();
        res.status(201).json({ success: true, data: user.address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.address = user.address.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.status(200).json({ success: true, data: user.address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 🕵️ 10. ดูโปรไฟล์คนอื่น (ฉบับอัปเกรด: ดึงข้อมูลผู้ติดตาม/กำลังติดตามออกมาด้วย)
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-address -password") // ไม่ส่งรหัสผ่านและที่อยู่
            .populate("followers", "username imageProfile") // ดึงข้อมูลผู้ติดตาม (ชื่อ+รูป)
            .populate("following", "username imageProfile"); // ดึงข้อมูลกำลังติดตาม (ชื่อ+รูป)

        if (!user) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้ใช้งาน" });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ➕ 11. ระบบติดตาม / เลิกติดตาม
export const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const myId = req.user._id;

        if (targetUserId === myId.toString()) return res.status(400).json({ message: "ไม่สามารถติดตามตัวเองได้" });

        const targetUser = await User.findById(targetUserId);
        const me = await User.findById(myId);

        if (!targetUser) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

        const isFollowing = me.following.some(id => id.toString() === targetUserId);

        if (isFollowing) {
            me.following = me.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== myId.toString());
        } else {
            me.following.push(targetUserId);
            targetUser.followers.push(myId);

            await Notification.create({
                receiver: targetUserId,
                sender: myId,
                type: "NEW_FOLLOWER",
                message: `${me.username} เริ่มติดตามคุณแล้ว!`
            });
        }

        await me.save();
        await targetUser.save();

        res.status(200).json({ success: true, isFollowing: !isFollowing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 12. ยืนยันอีเมล
export const verifyEmail = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { isEmailVerified: true }, { new: true });
        res.status(200).json({ success: true, message: "ยืนยันอีเมลสำเร็จ", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📧 13. ส่งอีเมลลืมรหัสผ่าน (สร้าง Token ของจริง)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body; // email field can be username or email
        const user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: email }]
        });

        if (!user) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งานหรืออีเมลในระบบ" });

        // สร้าง Token อายุ 15 นาที เพื่อใช้ในการรีเซ็ตรหัสผ่าน
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN, { expiresIn: "15m" });
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // 🚀 สั่งยิงอีเมล!
        const message = `คุณได้รับอีเมลนี้เนื่องจากมีการขอรีเซ็ตรหัสผ่าน\n\nกรุณาคลิกลิงก์นี้เพื่อดำเนินการต่อ (ลิงก์มีอายุ 15 นาที):\n\n ${resetUrl}`;
        await sendEmail({
            email: user.email,
            subject: "การขอรีเซ็ตรหัสผ่าน (TradeApp)",
            message: message
        });

        res.status(200).json({ success: true, message: "ส่งลิงก์รีเซ็ตไปที่อีเมลแล้ว" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        let errorMsg = error.message;
        if (error.message.includes('535')) {
            errorMsg = "ไม่สามารถเข้าสู่ระบบอีเมลได้ (SMTP Error 535) กรุณาตรวจสอบรหัสผ่านแอป (App Password) ในไฟล์ .env";
        }
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการส่งอีเมล: " + errorMsg });
    }
};

// 🗑️ 14. ลบบัญชีผู้ใช้งาน
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งาน" });
        }

        // 🛡️ ตรวจสอบรหัสผ่านก่อนลบ
        if (!password) {
            return res.status(400).json({ success: false, message: "กรุณาระบุรหัสผ่านเพื่อยืนยันการลบบัญชี" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
        }

        // 🛡️ ถ้าเป็นการตรวจสอบรหัสผ่านอย่างเดียว (Pre-check) ให้หยุดแค่นี้
        if (req.body.verifyOnly) {
            return res.status(200).json({ success: true, message: "รหัสผ่านถูกต้อง" });
        }

        // ลบ User ออกจากฐานข้อมูล
        await User.findByIdAndDelete(req.user._id);

        // ล้างข้อมูลใน Redis (ดัก Error เพื่อไม่ให้กระทบการลบหลัก)
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            try {
                await redis.del(`session:${req.user._id}`);
            } catch (redisError) {
                console.error("Redis session cleanup error:", redisError);
            }
        }

        // ล้าง Cookie
        const isProduction = process.env.NODE_ENV === "production";
        const clearOptions = { 
            httpOnly: true, 
            secure: isProduction, 
            sameSite: isProduction ? "none" : "lax" 
        };
        res.clearCookie("accessToken", clearOptions);
        res.clearCookie("refreshToken", clearOptions);

        res.status(200).json({ success: true, message: "ลบบัญชีเรียบร้อยแล้ว ขอบคุณที่ใช้บริการเรา" });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลบบัญชี: " + error.message });
    }
};

// 🔑 14. รีเซ็ตรหัสผ่านตัวจริง (รับ Token จากอีเมล)
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token) return res.status(400).json({ success: false, message: "ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน" });
        if (!newPassword) return res.status(400).json({ success: false, message: "กรุณากรอกรหัสผ่านใหม่" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        const user = await User.findById(decoded.id).select('+password');

        if (!user) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้งานนี้" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาทำรายการใหม่อีกครั้ง" });
    }
};

// 👥 15. ดึงรายชื่อเพื่อน (Mutual Follow เท่านั้น)
export const getFriends = async (req, res) => {
    try {
        const myId = req.user._id;
        const me = await User.findById(myId);

        // หาคนที่อยู่ในทั้งรายชื่อ followers และ following ของเรา
        const friendIds = me.following.filter(id =>
            me.followers.includes(id)
        );

        const friends = await User.find({ _id: { $in: friendIds } })
            .select("username imageProfile accountStatus");

        res.status(200).json({ success: true, data: friends });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};