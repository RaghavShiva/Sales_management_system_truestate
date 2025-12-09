import "dotenv/config";
import express from "express";
import cors from "cors";
import salesRoutes from "./routes/salesRoutes.js";
import { connectDB } from "./utils/DB.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length === 0 ? "*" : allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Sales API is running");
});

app.use("/api/sales", salesRoutes);

// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
});

async function start() {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server is running`);
        });
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
}

start();
