const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const FILE = path.join(__dirname, "tracks.json");

// =====================
// tracks API
// =====================
app.get("/tracks", (req, res) => {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

app.post("/add-track", (req, res) => {
  let data = [];

  try {
    data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {}

  data.push(req.body);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({ ok: true });
});

// =====================
// webhook endpoint
// =====================
app.post("/webhook", (req, res) => {
  console.log("📩 WEBHOOK:", req.body); // 👈 ВАЖНО
  require("./bot").handleUpdate(req.body);
  res.sendStatus(200);
});

// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});