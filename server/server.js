const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://finora981.vercel.app",
    "https://finora-iota-ivory.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Simple test routes
app.get("/", (req, res) => {
  res.json({ message: "Finora Backend is running!" });
});

app.get("/api", (req, res) => {
  res.json({ message: "API is working" });
});

// Temporary test
app.get("/api/test", (req, res) => {
  res.json({ message: "Test route works" });
});

module.exports = app;