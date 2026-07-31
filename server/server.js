const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "https://finora981.vercel.app",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());

// Connect to DB (safe for serverless)
connectDB().catch((err) => {
  console.error("DB connection failed:", err.message);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/savings", require("./routes/savingsRoutes"));
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", require("./routes/dashboardRoutes.js"));

// Health check (very useful)
app.get("/", (req, res) => {
  res.json({ message: "Finora Backend is running!" });
});

app.get("/api", (req, res) => {
  res.json({ message: "API is working" });
});

// Error handling
const errorHandler = require("./middleware/errorHandler.js");
app.use(errorHandler);

// ✅ Important for Vercel
module.exports = app;

// Only listen when running locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
