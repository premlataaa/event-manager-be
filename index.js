import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";
import mongoDb from "./configs/mongo.config.js";
import morgan from "morgan";
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use("/v1/user", userRouter);
app.use("/v1/event", eventRouter);

app.listen(PORT, () => {
    mongoDb();
    console.log(`Server is running on port ${PORT}`);
});
