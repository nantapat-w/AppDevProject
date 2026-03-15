import express from "express";
import { getAllUsers, updateUserStatus, deleteUserByAdmin, updateUserByAdmin, clearAllData } from "../controllers/admin.controller.js";
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettings.controller.js';
import { createCoupon, getAllCoupons, deleteCoupon, updateCoupon } from '../controllers/coupon.controller.js';
import { protectRoute } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = express.Router();

// All admin routes should be protected and only accessible by admins
router.use(protectRoute);
router.use(adminOnly);

router.get("/users", getAllUsers);
router.put("/users/:id", updateUserByAdmin);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUserByAdmin);

// Site Settings
router.get('/settings', getSiteSettings);
router.put('/settings', updateSiteSettings);

// Coupons
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Clear All Data
router.delete('/clear-data', clearAllData);

export default router;
