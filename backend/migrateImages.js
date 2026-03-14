import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import http from "http";
import Product from "./models/Product.model.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ฟังก์ชันตรวจสอบว่า URL ยังมีไฟล์อยู่ไหม
const checkUrl = (url) =>
  new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    }).on("error", () => resolve(false));
  });

const migrate = async () => {
  try {
    console.log("🔌 Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB.");

    const products = await Product.find({
      images: { $elemMatch: { $regex: "^http://localhost" } }
    });

    console.log(`📦 Found ${products.length} products with localhost image URLs\n`);

    let success = 0, failed = 0, skipped = 0;

    for (const product of products) {
      const newImages = [];

      for (const imgUrl of product.images) {
        if (!imgUrl.startsWith("http://localhost")) {
          newImages.push(imgUrl);
          continue;
        }

        const exists = await checkUrl(imgUrl);
        if (!exists) {
          console.log(`  ⚠️  File missing: ${product.productName} — keeping old URL`);
          newImages.push(imgUrl);
          skipped++;
          continue;
        }

        try {
          const uploadResult = await cloudinary.uploader.upload(imgUrl, {
            folder: "AppDevProducts",
          });
          console.log(`  ✅ Uploaded [${product.productName}] => ${uploadResult.secure_url}`);
          newImages.push(uploadResult.secure_url);
          success++;
        } catch (err) {
          console.log(`  ❌ Upload failed [${product.productName}]: ${err.message}`);
          newImages.push(imgUrl);
          failed++;
        }
      }

      await Product.findByIdAndUpdate(product._id, { images: newImages });
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   ✅ Uploaded to Cloudinary: ${success}`);
    console.log(`   ⚠️  Skipped (file missing): ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    process.exit(0);
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
};

migrate();
