import express from "express";
import { protectRoute, authorize } from "../middlewares/auth.middleware.js";
import { getAllUsers, updateUserStatus, deleteUser } from "../controllers/admin.controller.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { createCoupon, getAllCoupons, deleteCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

// All routes here are protected and require admin role
router.use(protectRoute);
router.use(authorize("admin"));

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Global Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Coupon Management
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;
