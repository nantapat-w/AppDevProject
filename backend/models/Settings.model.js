import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    bannerTitle: { type: String, default: "เทศกาลแลกของ" },
    bannerDiscount: { type: String, default: "ลดค่าธรรมเนียม 50%" },
    bannerCode: { type: String, default: "TRADE50" },
    bannerDescription: { type: String, default: "ใช้โค้ด \"TRADE50\" เมื่อทำการยืนยันการแลกเปลี่ยน" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSingleton = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
