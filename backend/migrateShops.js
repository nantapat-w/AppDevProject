import mongoose from "mongoose";
import dotenv from "dotenv";
import Shop from "./models/Shop.model.js";

dotenv.config();

const migrate = async () => {
    try {
        console.log("Connecting to DB...");
        // using MONGO_URI from .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const shops = await Shop.find({ shopCode: { $exists: false } });
        console.log(`Found ${shops.length} shops without a shopCode.`);
        
        for (const shop of shops) {
             let shopCode;
             let isUnique = false;
             while (!isUnique) {
                 shopCode = Math.floor(100000 + Math.random() * 900000).toString();
                 const existingCode = await Shop.findOne({ shopCode });
                 if (!existingCode) {
                     isUnique = true;
                 }
             }
             shop.shopCode = shopCode;
             await shop.save();
             console.log(`Updated shop ${shop.shopName} with code ${shopCode}`);
        }
        
        console.log("Migration completed.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
