import express from "express";
import { 
    getAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
} from "../controllers/accountsetting.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/addresses", protectRoute, getAddresses);
router.post("/addresses", protectRoute, addAddress);
router.put("/addresses/:addressId", protectRoute, updateAddress);
router.delete("/addresses/:addressId", protectRoute, deleteAddress);
router.patch("/addresses/:addressId/default", protectRoute, setDefaultAddress);

export default router;
