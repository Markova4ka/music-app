const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const FILE = "./tracks.json";

// получить все треки
app.get("/tracks", (req, res) => {
  const data = fs.readFileSync(FILE);
  res.json(JSON.parse(data));
});

// добавить трек
app.post("/tracks", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  data.push(req.body);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});

const axios = require("axios");

const TOKEN = "8703415232:AAG7GH_U3qw9uV9ZLgKKn1UovuOZD-Dnr6Q";

// получить ссылку на аудио
app.get("/audio/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    // 1. получаем путь к файлу
    const fileRes = await axios.get(
      `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${file_id}`
    );

    const file_path = fileRes.data.result.file_path;

    // 2. создаём ссылку
    const url = `https://api.telegram.org/file/bot${TOKEN}/${file_path}`;

    res.json({ url });

  } catch (e) {
    res.status(500).json({ error: "Ошибка получения файла" });
  }
});