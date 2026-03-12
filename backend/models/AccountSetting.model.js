import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    label: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine: { type: String, required: true },
    subDistrict: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const accountSettingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    addresses: [addressSchema]
}, { timestamps: true });

const AccountSetting = mongoose.model("AccountSetting", accountSettingSchema);
export default AccountSetting;
