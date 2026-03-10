import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

const communitySchema = new mongoose.Schema({
    // ผู้โพสต์
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    // คอนเทนต์
    content:{
        type:String,
        required:true
    },
    // images
    images:[
        {
            type:String,
            default:""
        }
    ],
    postType:{
        type:String,
        enum:[
            "GENERAL", //พูดคุยสอบถามทั่วไป
            "FINDING_ITEM", // ตามหาสินค้า
            "TRADE_OFFER", // เสนอแลกของ
            "REVIEW", // รีวิว
            "WARNING" // เตือนภัย
        ],
        default:"GENERAL",
        required:true
    },
    // สินค้าที่อ้างอิงถึง (ถ้าโพสต์นี้พูดถึงสินค้าในร้าน ก็แท็ก ID สินค้ามาเก็บไว้ตรงนี้)
    referencedProduct: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product",
        default: null
    },
    // แท็ก (เช่น "#หาของ", "#รีวิว")
    tags: [{ 
        type: String,
        trim: true 
    }],
    // คนที่มากดไลค์ (เก็บ ID ของ User จะได้รู้ว่าใครกดบ้าง)
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    // คอมเมนต์ (เอา Schema ด้านบนมาฝังไว้ตรงนี้)
    comments: [commentSchema],

    status: {
        type: String,
        enum: ["ACTIVE", "EDITED", "RESOLVED", "DELETED"], 
        default: "ACTIVE"
    }
}, { timestamps: true });

const Community = mongoose.model("Community", communitySchema);
export default Community;