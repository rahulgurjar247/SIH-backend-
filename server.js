// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import routes
import routes from "./routes/index.js";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------------- Security Middleware -----------------
app.use(helmet());
app.use(compression());

// Rate limiting (avoid abuse / DDOS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// ----------------- CORS Setup -----------------
const allowedOrigins = [
  "https://sih-dashboard-seven.vercel.app", // frontend prod
  "http://localhost:5173", // vite local
  "http://localhost:3000", // react local
];

// Allow FRONTEND_URL from env if provided (avoids hardcoding in multiple places)
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / mobile apps
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // enable global CORS preflight handling

// ----------------- Body Parsing -----------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ----------------- Logging -----------------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ----------------- Static Files -----------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------------- Utility Endpoints -----------------
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV || "development",
    allowedOrigins,
    frontendUrl: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString(),
  });
});

app.get("/cors-debug", (req, res) => {
  res.json({
    origin: req.get("Origin"),
    allowedOrigins,
    message: "CORS debug endpoint working",
  });
});

// ----------------- API Routes -----------------
app.use("/api/v1", routes);

// ----------------- Error Handling -----------------
app.use(notFound);
app.use(errorHandler);

// ----------------- Database Connection -----------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.success("Database connected", {
      host: conn.connection.host,
      database: conn.connection.name,
    });
  } catch (error) {
    logger.error("Database connection failed", error);
    process.exit(1);
  }
};

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.success("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        apiBase: `http://localhost:${PORT}/api/v1`,
      });
    });
  } catch (error) {
    logger.error("Server startup failed", error);
    process.exit(1);
  }
};

// ----------------- Process Error Handlers -----------------
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

startServer();
