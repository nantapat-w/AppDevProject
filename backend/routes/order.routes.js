import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder } from "../controllers/order.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createOrder);
router.get("/my-orders", protectRoute, getMyOrders);
router.get("/:id", protectRoute, getOrderById);
router.patch("/:id/cancel", protectRoute, cancelOrder);

export default router;
