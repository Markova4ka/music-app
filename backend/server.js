const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const FILE = "./tracks.json";

// -------------------
// load / save
// -------------------
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

// -------------------
// ping (проверка сервера)
// -------------------
app.get("/ping", (req, res) => {
  res.send("pong");
});

// -------------------
// получить треки
// -------------------
app.get("/tracks", (req, res) => {
  res.json(loadTracks());
});

// -------------------
// webhook Telegram
// -------------------
app.post("/webhook", (req, res) => {
  const update = req.body;

  // Telegram может прислать либо message, либо channel_post
  const msg = update.message || update.channel_post;

  if (!msg) return res.sendStatus(200);

  // пытаемся найти музыку
  const audio =
    msg.audio ||
    msg.voice ||
    msg.document ||
    msg.video;

  // ❌ если нет медиа — игнорируем (это текстовый пост)
  if (!audio) return res.sendStatus(200);

  // ❌ фильтр: если это документ, но не музыка (по mime)
  if (audio.mime_type && !audio.mime_type.startsWith("audio") && !audio.mime_type.startsWith("video")) {
    return res.sendStatus(200);
  }

  const track = {
    title: audio.title || audio.file_name || "Unknown",
    performer: audio.performer || "Unknown",
    file_id: audio.file_id,
    type: audio.mime_type || "unknown",
    date: msg.date
  };

  const tracks = loadTracks();

  // защита от дублей
  const exists = tracks.find(t => t.file_id === track.file_id);
  if (!exists) {
    tracks.push(track);
    saveTracks(tracks);

    console.log("🎵 saved track:", track);
  }

  res.sendStatus(200);
});

// -------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on", PORT);
});