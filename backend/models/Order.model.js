import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        length: 18
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // 📦 รายการสินค้าที่ซื้อ
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productName: String,
        productDescription: String,
        quantity: Number,
        price: Number,
        image: String
    }],
    // 🚚 ที่อยู่จัดส่ง
    shippingAddress: {
        fullName: String,
        phoneNumber: String,
        addressLine: String,
        subDistrict: String,
        district: String,
        province: String,
        zipCode: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"], // รอชำระ, จ่ายแล้ว, ส่งแล้ว, ได้รับแล้ว, ยกเลิก
        default: "PAID"
    },
    discountCode: {
        type: String,
        default: ""
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    originalAmount: {
        type: Number,
        default: 0
    },
    shopName: {
        type: String,
        default: "Shopify Store"
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
