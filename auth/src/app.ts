import express, { type NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./auth.routes.ts";
import { type Request, type Response } from "express";

dotenv.config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_AUTH_URI).then(() => {
    console.log("=====>>> Connected to MongoDB");
}).catch((err) => {
    console.log("^^^^^MongoDB connection error:", err);
});

// rate limit function
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(process.env.RATE_LIMIT_MAX),
    message: "Too many requests, please try again later.",
});


//! middlewares
// convert response to json format
app.use(express.json());
// parse cookies
app.use(cookieParser());
// cors
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(helmet());
app.use(morgan("dev"));

app.use(limiter);

//routes
app.use("/", authRoutes);

// error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const message = err?.message || "something went wrong";
    console.log(message);
    res.status(500).json({ status: "fail", message });
});

// 404 middleware
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "request not found" });
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
});