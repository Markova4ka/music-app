const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

// ✅ безопасный путь к файлу
const FILE = path.join(__dirname, "tracks.json");

// ✅ берём токен из Environment Variables (Render)
const TOKEN = process.env.BOT_TOKEN;

// ======================
// GET ALL TRACKS
// ======================
app.get("/tracks", (req, res) => {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (e) {
    res.json([]);
  }
});

// ======================
// ADD TRACK
// ======================
app.post("/add-track", (req, res) => {
  let data = [];

  try {
    const fileData = fs.readFileSync(FILE, "utf-8");
    data = JSON.parse(fileData);
  } catch (e) {}

  data.push(req.body);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({ ok: true });
});

// ======================
// GET TELEGRAM AUDIO URL
// ======================
app.get("/audio/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileRes = await axios.get(
      `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${file_id}`
    );

    const file_path = fileRes.data.result.file_path;

    const url = `https://api.telegram.org/file/bot${TOKEN}/${file_path}`;

    res.json({ url });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка получения файла" });
  }
});

// ======================
// HEALTH CHECK
// ======================
app.get("/ping", (req, res) => {
  res.send("ok");
});

// ======================
// KEEP ALIVE LOG (НЕ ДЕРЖИТ СЕРВЕР ЖИВЫМ, ТОЛЬКО ЛОГ)
// ======================
setInterval(() => {
  console.log("ping...");
}, 300000);

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});

// ======================
// START BOT (same process)
// ======================
require("./bot");