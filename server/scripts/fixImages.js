import "dotenv/config";
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Car from "../models/Car.js";
import mongoose from "mongoose";

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI + "/car-rental");
    console.log("Connected to MongoDB.");
    const cars = await Car.find();
    
    for (const car of cars) {
      if (car.model === "X5") {
        const buf = fs.readFileSync("../client/src/assets/car_image1.png");
        const res = await imagekit.upload({ file: buf, fileName: "bmw_x5.png", folder: "/cars" });
        car.image = res.url;
        await car.save();
        console.log("Updated X5 image:", res.url);
      }
      if (car.model === "Wrangler") {
        const buf = fs.readFileSync("../client/src/assets/car_image3.png");
        const res = await imagekit.upload({ file: buf, fileName: "jeep_wrangler.png", folder: "/cars" });
        car.image = res.url;
        await car.save();
        console.log("Updated Wrangler image:", res.url);
      }
      if (car.model === "Neo 6") {
        const buf = fs.readFileSync("../client/src/assets/car_image4.png");
        const res = await imagekit.upload({ file: buf, fileName: "ford_neo.png", folder: "/cars" });
        car.image = res.url;
        await car.save();
        console.log("Updated Ford Neo image:", res.url);
      }
    }
    console.log("All broken images fixed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing images:", err);
    process.exit(1);
  }
}

fix();
