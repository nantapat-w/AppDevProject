import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username : {
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:[3,"ชื่อผู้ใช้ควรมีความยาวอย่างน้อย 3 ตัวอักษร"],
        maxlength:[20,"ชื่อผู้ใช้ควรมีความยาวไม่เกิน 20 ตัวอักษร"],
        match: [/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้งานต้องเป็นภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น']

    },
    password:{
        type:String,
        required:[true , "กรุณาใส่รหัสผ่าน"],
        minlength:[6,"รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"],
        select:false
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
        type:String
    },
    phoneNumber:{
        type:String,
        match: [/^[0-9\-\s]{9,15}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (ตัวเลข 9-15 หลัก)'],
    },
    role:{
        type:String,
        enum:["user" , "admin"  ,"official_store"],
        default:"user"
    },
    address:[{
        label:String,
        addressLine:String,
        province:String,
        zipCode:String,
        isDefault:{
            type:Boolean,
            default:false
        }
    }],
    trustScore:{
        type:Number,
        min:0,
        max:5,
        default:5
    },
    tradeCount:{
        type:Number,
        default:0
    },
    successfulTrade:{
        type:Number,
        default:0
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    accountStatus:{
        type:String,
        enum:["active" , "suspended" , "banned"],
        default:"active"

    },
    lastLogin:{
        type:Date
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
},{timestamps:true});

const User = mongoose.model("User",userSchema);
export default User;