import Settings from "../models/Settings.model.js";

export const getSettings = async (req, res) => {
    try {
        const settings = await Settings.getSingleton();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.getSingleton();
        Object.assign(settings, req.body);
        await settings.save();
        res.status(200).json({ success: true, message: "อัปเดตการตั้งค่าสำเร็จ", data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
