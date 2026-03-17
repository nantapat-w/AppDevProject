import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    // 👤 ข้อมูลพื้นฐานสำหรับระบุตัวตน
    username : {
        type:String,
        required:true,
        unique:true, // ชื่อก้องโลก ต้องไม่ซ้ำใคร
        trim:true,
        minlength:[3,"ชื่อผู้ใช้ควรมีความยาวอย่างน้อย 3 ตัวอักษร"],
        maxlength:[20,"ชื่อผู้ใช้ควรมีความยาวไม่เกิน 20 ตัวอักษร"],
        match: [/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้งานต้องเป็นภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น']
    },
    password:{
        type:String,
        required:[true , "กรุณาใส่รหัสผ่าน"],
        minlength:[6,"รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"],
        select:false // ตอน Query ปกติจะไม่ดึงรหัสผ่านออกมา เพื่อความปลอดภัย (ยกเว้นสั่ง .select('+password'))
    },
    email:{
        type:String,
        required:[true , "กรุณากรอก email"],
        unique:true,
        trim:true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'รูปแบบอีเมลไม่ถูกต้อง'] 
    },
    imageProfile:{
        type:String // URL รูปภาพโปรไฟล์ (Cloudinary)
    },
    phoneNumber:{
        type:String,
        match: [/^[0-9\-\s]{9,15}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (ตัวเลข 9-15 หลัก)'],
    },
    gender: {
        type: String,
        enum: ["ชาย", "หญิง", "อื่นๆ", null],
        default: null
    },
    birthday: {
        type: Date,
        default: null
    },
    bio: {
        type: String,
        maxlength: [200, "Bio ไม่ควรเกิน 200 ตัวอักษร"],
        default: ""
    },
    // 🛡️ สถานะและบทบาท
    role:{
        type:String,
        enum:["user" , "admin"  ,"official_store"], // user ทั่วไป, แอดมินดูแลระบบ, ร้านทางการ
        default:"user"
    },
    // 📍 ข้อมูลที่อยู่ (อาเรย์ของ Object)
    address:[{
        label:String, // เช่น "บ้าน", "ที่ทำงาน"
        addressLine:String,
        province:String,
        zipCode:String,
        isDefault:{
            type:Boolean,
            default:false
        }
    }],
    // ⭐ คะแนนความน่าเชื่อถือ สถิติแลกเปลี่ยน
    trustScore:{
        type:Number,
        min:0,
        max:5,
        default:5
    },
    tradeCount:{
        type:Number, // จำนวนครั้งที่พยายามแลก
        default:0
    },
    successfulTrade:{
        type:Number, // จำนวนครั้งที่แลกสำเร็จจริง
        default:0
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    accountStatus:{
        type:String,
        enum:["active" , "suspended" , "banned"], // ปกติ, ระงับชั่วคราว, แบนถาวร
        default:"active"
    },
    lastLogin:{
        type:Date
    },
    // 🤝 ระบบสังคม (Followers/Following)
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // คนที่มาติดตามเรา
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // คนที่เราไปติดตามเขา
    
},{timestamps:true}); // timestamps=true จะสร้าง createdAt และ updatedAt ให้อัตโนมัติ

const User = mongoose.model("User",userSchema);
export default User;