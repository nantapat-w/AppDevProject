import express from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; // Assuming this middleware exists from previous conversations

const router = express.Router();

router.post("/", protectRoute, createOrder);
router.get("/my-orders", protectRoute, getMyOrders);

export default router;
