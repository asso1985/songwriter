import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import healthRouter from "./routes/health.js";
import explainRouter from "./routes/explain.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const port = parseInt(process.env.PORT ?? "4000", 10);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  }),
);
app.use(express.json());

// Health route before rate limiter
app.use("/api", healthRouter);

// Rate limiter for non-health routes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

// Routes
app.use("/api", explainRouter);

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

export default app;
