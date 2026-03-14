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
        enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PAID"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
