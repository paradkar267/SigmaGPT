import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";
import dns from "node:dns";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import User from "./model/user.js";
import passport from "./utils/passport.js";

const app = express();
const PORT = process.env.PORT || 8000;
const DNS_SERVERS = (process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isViteDevPort = Number(url.port) >= 5173 && Number(url.port) <= 5179;
    return url.protocol === "http:" && isLocalHost && isViteDevPort;
  } catch {
    return false;
  }
};

if (DNS_SERVERS.length > 0) {
  dns.setServers(DNS_SERVERS);
}

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sigma-gpt-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: false,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

app.get("/demouser", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database is not connected" });
    }

    const email = "demo@example.com";
    let demoUser = await User.findOne({ email });

    if (!demoUser) {
      demoUser = await User.register(
        new User({
          name: "Demo User",
          email,
        }),
        "demopassword",
      );
    }

    res.json(demoUser.toSafeObject());
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

const connectDB = async () => {
  if (!process.env.MONGODB_URL) {
    console.warn("MONGODB_URL is not configured. Starting without database connection.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. Starting server without database access:", error.message);
    return false;
  }
};

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
