import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

app.use(limiter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "healthy",
        application: "PennyPilot API",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    res.status(500).json({
      error: "Failed to retrieve categories",
    });
  }
});

// Start server
const startServer = async () => {
    try {
        await prisma.$connect();

        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`PennyPilot API running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();
