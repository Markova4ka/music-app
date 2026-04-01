const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const FILE = "./tracks.json";

// =====================
// LOAD / SAVE
// =====================
function loadTracks() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveTracks(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// =====================
// PING (Render wake)
// =====================
app.get("/ping", (req, res) => {
  res.send("pong");
});

// =====================
// GET TRACKS
// =====================
app.get("/tracks", (req, res) => {
  res.json(loadTracks());
});

// =====================
// TELEGRAM WEBHOOK
// =====================
app.post("/webhook", (req, res) => {
  const update = req.body;

  const msg = update.message || update.channel_post;
  if (!msg) return res.sendStatus(200);

  const audio =
    msg.audio ||
    msg.voice ||
    msg.document;

  // ❌ игнор текста
  if (!audio) return res.sendStatus(200);

  const tracks = loadTracks();

  const track = {
    title: audio.title || audio.file_name || "Без названия",
    performer: audio.performer || "Unknown",
    file_id: audio.file_id,
    date: msg.date
  };

  // ❌ убираем дубликаты
  const exists = tracks.find(t => t.file_id === track.file_id);
  if (!exists) {
    tracks.push(track);
    saveTracks(tracks);
    console.log("🎵 saved:", track.title);
  }

  res.sendStatus(200);
});

// =====================
// AUDIO STREAM (ВАЖНО)
// =====================
app.get("/audio/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const tgRes = await axios.get(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${file_id}`
    );

    const filePath = tgRes.data.result.file_path;

    const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;

    res.json({ url });

  } catch (e) {
    console.log("audio error:", e.message);
    res.status(500).json({ error: "failed to get audio" });
  }
});

// =====================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on", PORT);
});