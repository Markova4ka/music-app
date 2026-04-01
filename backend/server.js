const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const FILE = "./tracks.json";

// -------------------
// load/save
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
// webhook (Telegram будет сюда слать)
// -------------------
app.post("/webhook", (req, res) => {
  console.log("🔥 webhook received:", req.body);

  const tracks = loadTracks();

  // пример: просто сохраняем всё что пришло
  tracks.push(req.body);

  saveTracks(tracks);

  res.sendStatus(200);
});

// -------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on", PORT);
});