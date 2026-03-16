import AccountSetting from "../models/AccountSetting.model.js";

// @desc Get all addresses for the logged-in user
// @route GET /api/account-settings/addresses
// @access Private
export const getAddresses = async (req, res) => {
    try {
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            accountSetting = new AccountSetting({ 
                userId: req.user._id, 
                addresses: [{
                    label: 'SYSTEM_RESERVED',
                    fullName: 'SYSTEM',
                    phoneNumber: '0000000000',
                    addressLine: 'SYSTEM',
                    subDistrict: 'SYSTEM',
                    district: 'SYSTEM',
                    province: 'SYSTEM',
                    zipCode: '00000',
                    isDefault: false
                }] 
            });
            await accountSetting.save();
        } else if (accountSetting.addresses.length === 0 || accountSetting.addresses[0].label !== 'SYSTEM_RESERVED') {
            // Ensure index 0 is always our sentinel
            accountSetting.addresses.unshift({
                label: 'SYSTEM_RESERVED',
                fullName: 'SYSTEM',
                phoneNumber: '0000000000',
                addressLine: 'SYSTEM',
                subDistrict: 'SYSTEM',
                district: 'SYSTEM',
                province: 'SYSTEM',
                zipCode: '00000',
                isDefault: false
            });
            await accountSetting.save();
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
        let { label, fullName, phoneNumber, addressLine, subDistrict, district, province, zipCode, isDefault } = req.body;
        
        let accountSetting = await AccountSetting.findOne({ userId: req.user._id });
        
        if (!accountSetting) {
            accountSetting = new AccountSetting({ 
                userId: req.user._id, 
                addresses: [{
                    label: 'SYSTEM_RESERVED',
                    fullName: 'SYSTEM',
                    phoneNumber: '0000000000',
                    addressLine: 'SYSTEM',
                    subDistrict: 'SYSTEM',
                    district: 'SYSTEM',
                    province: 'SYSTEM',
                    zipCode: '00000',
                    isDefault: false
                }] 
            });
            await accountSetting.save();
        } else if (accountSetting.addresses.length === 0 || accountSetting.addresses[0].label !== 'SYSTEM_RESERVED') {
            // Ensure index 0 is always our sentinel
            accountSetting.addresses.unshift({
                label: 'SYSTEM_RESERVED',
                fullName: 'SYSTEM',
                phoneNumber: '0000000000',
                addressLine: 'SYSTEM',
                subDistrict: 'SYSTEM',
                district: 'SYSTEM',
                province: 'SYSTEM',
                zipCode: '00000',
                isDefault: false
            });
            await accountSetting.save();
        }

        // If it's the first REAL address, set as default
        // The first dummy address is index 0, so real addresses start at index 1
        if (accountSetting.addresses.filter(a => a.label !== 'SYSTEM_RESERVED').length === 0) {
            isDefault = true;
        }

        // If new address is set as default, unset others (excluding SYSTEM_RESERVED)
        if (isDefault) {
            accountSetting.addresses.forEach(addr => {
                if (addr.label !== 'SYSTEM_RESERVED') {
                    addr.isDefault = false;
                }
            });
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
            isDefault
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

        const address = accountSetting.addresses.id(addressId);
        
        if (!address) {
            return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
        }

        if (address.label === 'SYSTEM_RESERVED') {
            return res.status(403).json({ success: false, message: "ไม่สามารถแก้ไขข้อมูลระบบได้" });
        }

        // If setting as default, unset others (excluding system reserved which is never default)
        if (updates.isDefault) {
            accountSetting.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
            address.isDefault = true;
        }

        // Update fields
        const allowedUpdates = ['label', 'fullName', 'phoneNumber', 'addressLine', 'subDistrict', 'district', 'province', 'zipCode', 'isDefault'];
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
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

        if (addressToDelete.label === 'SYSTEM_RESERVED') {
            return res.status(403).json({ success: false, message: "ไม่สามารถลบข้อมูลระบบได้" });
        }

        const wasDefault = addressToDelete.isDefault;
        
        // Use explicit filter to ensure deletion
        accountSetting.addresses = accountSetting.addresses.filter(addr => addr._id.toString() !== addressId);

        // If we deleted the default address, set the first remaining REAL one as default if any exist
        if (wasDefault) {
            const firstRealAddress = accountSetting.addresses.find(addr => addr.label !== 'SYSTEM_RESERVED');
            if (firstRealAddress) {
                firstRealAddress.isDefault = true;
            }
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
