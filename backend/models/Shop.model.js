    import mongoose from "mongoose";

    const shopSchema = new mongoose.Schema({
        ownerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:[true , "ร้านค้าต้องมีเจ้าของ UserId"],
            unique:true
        },
        //รหัสร้านค้า 6 หลัก
        shopCode:{
            type:String,
            unique:true,
            required:true,
            length:6
        },
        
        //ข้อมูลหน้าร้าน
        shopName:{
            type:String,
            required:[true , "กรุณากรอกชื่อร้าน"],
            unique:true,
            trim:true,
            maxlength:[50,"ชื่อร้านต้องมีขนาดไม่เกิน 50 ตัวอักษร"]
        },
        shopDescription:{
            type:String,
            default:"ยินดรต้อนรับสู่ร้านค้าของเรา"
        },
        shopLogo:{
            type:String,
            default:""
        },
        shopBanner:{
            type:String,
            default:""
        },
        //สถิติร้านค้า เอาไว้โชว์ตึงๆ
        rating:{
            type:Number,
            min:0,
            max:5,
            default:0
        },
        //ยอดการรีวิวร้าน
        reviewCount:{
            type:Number,
            default:0
        },
        followerCount:{
            type:Number,
            default:0
        },
        likeCount:{
            type:Number,
            default:0
        },

        // ระดับของร้านค้า
        isOfficial:{
            type:Boolean,
            default:false
        },
        status:{
            type:String,
            enum:["active" , "on_vacation" , "suspended" , "banned"],
            default:"active"
        },

    },{timestamps:true})

    const Shop = mongoose.model("Shop" , shopSchema);
    export default Shop;