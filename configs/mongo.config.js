import mongoose from "mongoose";

export default function mongoDb() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Mongo DB Connection Successful! ✅");
    })
    .catch((error) => {
      console.error("MongoDB connection error ❌:", error);
      process.exit(1);
    });
}
