require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const router = require("./routers/index");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const logger = require("./config/logger");
const CronJobs = require("./config/cron");

const app = express();
const PORT = process.env.PORT || 8015;

// Trust proxy for ngrok, nginx, load balancers
app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(",")
	: [process.env.FRONTEND_URL || "http://localhost:3000"];

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		if (
			allowedOrigins.indexOf(origin) !== -1 ||
			process.env.NODE_ENV !== "production"
		) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
	maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Rate Limiting - Apply to all routes
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: process.env.NODE_ENV === "production" ? 100 : 1000, // More lenient in dev
	message: {
		success: false,
		message: "Too many requests, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipFailedRequests: false,
	skipSuccessfulRequests: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// HTTP Request Logging with Morgan
// Morgan logs HTTP requests, Winston logs application events
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
	morgan(morganFormat, {
		stream: {
			write: (message) => logger.http(message.trim()),
		},
	})
);

// Static Files
app.use("/uploads", express.static("uploads"));

// API Routes
app.use(router);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Initialize cron jobs
CronJobs.init();

// Start Server
app.listen(PORT, () => {
	logger.info(`Server running on port ${PORT}`);
	logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
