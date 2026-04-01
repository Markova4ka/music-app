const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

// 🔥 ВАЖНО: CORS (фикс твоей ошибки)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// -------------------
// 📌 ТВОИ ДАННЫЕ
// -------------------
let tracks = [];

// -------------------
// 📌 PING (проверка сервера)
// -------------------
app.get("/ping", (req, res) => {
  res.send("pong");
});

// -------------------
// 📌 ПОЛУЧИТЬ ТРЕКИ
// -------------------
app.get("/tracks", (req, res) => {
  res.json(tracks);
});

// -------------------
// 📌 ДОБАВИТЬ ТРЕК (из бота)
// -------------------
app.post("/addTrack", (req, res) => {
  const track = req.body;

  tracks.push(track);

  console.log("➕ Добавлен трек:", track);

  res.json({ ok: true });
});

// -------------------
// 📌 ПОЛУЧИТЬ АУДИО (пример)
// -------------------
app.get("/audio/:file_id", (req, res) => {
  const file_id = req.params.file_id;

  // тут у тебя должна быть логика получения ссылки
  res.json({
    url: `https://example.com/audio/${file_id}.mp3`
  });
});

// -------------------
// 📌 СТАРТ СЕРВЕРА
// -------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});