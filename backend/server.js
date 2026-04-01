const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const FILE = "./tracks.json";
const TOKEN = "8703415232:AAG7GH_U3qw9uV9ZLgKKn1UovuOZD-Dnr6Q";

// получить все треки
app.get("/tracks", (req, res) => {
  try {
    const data = fs.readFileSync(FILE);
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

// добавить трек
app.post("/add-track", (req, res) => {
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(FILE));
  } catch {}

  data.push(req.body);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({ ok: true });
});

// получить ссылку на аудио
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
    res.status(500).json({ error: "Ошибка получения файла" });
  }
});

app.get("/ping", (req, res) => {
  res.send("ok");
});

// пинг чтобы сервер не спал
setInterval(() => {
  console.log("ping...");
}, 300000);

app.listen(3000, () => {
  console.log("Server started");
});