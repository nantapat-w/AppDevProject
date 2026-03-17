    import mongoose from "mongoose";

    const shopSchema = new mongoose.Schema({
        // 🔑 เจ้าของร้าน (เชื่อมกับ User)
        ownerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:[true , "ร้านค้าต้องมีเจ้าของ UserId"],
            unique:true // 1 คนมีได้แค่ 1 ร้าน (ในระบบนี้)
        },
        // 🆔 รหัสร้านค้า 6 หลัก (เอาไว้ค้นหาหรืออ้างอิง)
        shopCode:{
            type:String,
            unique:true,
            required:true,
            length:6
        },
        
        // 🏠 ข้อมูลหน้าร้าน
        shopName:{
            type:String,
            required:[true , "กรุณากรอกชื่อร้าน"],
            unique:true,
            trim:true,
            maxlength:[50,"ชื่อร้านต้องมีขนาดไม่เกิน 50 ตัวอักษร"]
        },
        shopDescription:{
            type:String,
            default:"ยินดีต้อนรับสู่ร้านค้าของเรา"
        },
        shopLogo:{
            type:String, // URL รูปโลโก้ (Cloudinary)
            default:""
        },
        shopBanner:{
            type:String, // URL รูปแบนเนอร์ (Cloudinary)
            default:""
        },
        // 📊 สถิติร้านค้า
        rating:{
            type:Number,
            min:0,
            max:5,
            default:0
        },
        reviewCount:{
            type:Number, // จำนวนคนที่มารีวิว
            default:0
        },
        followerCount:{
            type:Number, // จำนวนคนติดตามร้าน
            default:0
        },
        likeCount:{
            type:Number, // จำนวนคนกดไลก์ร้าน
            default:0
        },

        // 🎖️ สถานะและระดับร้านค้า
        isOfficial:{
            type:Boolean, // ร้านค้าทางการ (ยืนยันแล้ว)
            default:false
        },
        status:{
            type:String,
            enum:["active" , "on_vacation" , "suspended" , "banned"], // เปิดปกติ, พักร้อน, ระงับ, แบน
            default:"active"
        },

    },{timestamps:true})

    const Shop = mongoose.model("Shop" , shopSchema);
    export default Shop;