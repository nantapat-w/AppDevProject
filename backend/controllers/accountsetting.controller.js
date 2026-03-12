import AccountSetting from "../models/AccountSetting.model.js";

// @desc Get all addresses for a user
// @route GET /api/account-settings/addresses
// @access Private
export const getAddresses = async (req, res) => {
    try {
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            // Create initial account setting if it doesn't exist
            accountSetting = await AccountSetting.create({ userId: req.user._id, addresses: [] });
        }
        
        res.status(200).json({
            success: true,
            addresses: accountSetting.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Add a new address
// @route POST /api/account-settings/addresses
// @access Private
export const addAddress = async (req, res) => {
    try {
        const { label, fullName, phoneNumber, addressLine, subDistrict, district, province, zipCode, isDefault } = req.body;
        
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            accountSetting = new AccountSetting({ userId: req.user._id, addresses: [] });
        }

        // If this is the first address, it should be default
        const actualIsDefault = accountSetting.addresses.length === 0 ? true : isDefault;

        // If new address is set as default, unset others
        if (actualIsDefault) {
            accountSetting.addresses.forEach(addr => addr.isDefault = false);
        }

        accountSetting.addresses.push({
            label,
            fullName,
            phoneNumber,
            addressLine,
            subDistrict,
            district,
            province,
            zipCode,
            isDefault: actualIsDefault
        });

        await accountSetting.save();
        
        res.status(201).json({
            success: true,
            message: "เพิ่มที่อยู่สำเร็จ",
            addresses: accountSetting.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update an existing address
// @route PUT /api/account-settings/addresses/:addressId
// @access Private
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updates = req.body;
        
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลบัญชี" });
        }

        const addressIndex = accountSetting.addresses.findIndex(addr => addr._id.toString() === addressId);
        
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
        }

        // If setting as default, unset others
        if (updates.isDefault) {
            accountSetting.addresses.forEach(addr => addr.isDefault = false);
        }

        // Update fields
        const address = accountSetting.addresses[addressIndex];
        Object.keys(updates).forEach(key => {
            if (key !== '_id') {
                address[key] = updates[key];
            }
        });

        await accountSetting.save();
        
        res.status(200).json({
            success: true,
            message: "อัปเดตที่อยู่สำเร็จ",
            addresses: accountSetting.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete an address
// @route DELETE /api/account-settings/addresses/:addressId
// @access Private
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลบัญชี" });
        }

        const addressToDelete = accountSetting.addresses.id(addressId);
        if (!addressToDelete) {
            return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
        }

        const wasDefault = addressToDelete.isDefault;
        addressToDelete.deleteOne();

        // If we deleted the default address, set the first one as default if any exist
        if (wasDefault && accountSetting.addresses.length > 0) {
            accountSetting.addresses[0].isDefault = true;
        }

        await accountSetting.save();
        
        res.status(200).json({
            success: true,
            message: "ลบที่อยู่สำเร็จ",
            addresses: accountSetting.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Set an address as default
// @route PATCH /api/account-settings/addresses/:addressId/default
// @access Private
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลบัญชี" });
        }

        let addressFound = false;
        accountSetting.addresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                addressFound = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (!addressFound) {
            return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
        }

        await accountSetting.save();
        
        res.status(200).json({
            success: true,
            message: "ตั้งเป็นที่อยู่หลักแล้ว",
            addresses: accountSetting.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
