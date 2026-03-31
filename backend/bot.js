const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");

const TOKEN = "8703415232:AAG7GH_U3qw9uV9ZLgKKn1UovuOZD-Dnr6Q";
const API = "http://localhost:3000/tracks";

const bot = new TelegramBot(TOKEN, { polling: true });

// проверка дубликатов
function exists(file_id, list) {
  return list.some(t => t.file_id === file_id);
}

// загрузка из канала при старте
async function syncChannel() {
  console.log("Синхронизация канала...");

  const res = await axios.get(API);
  const existing = res.data;

  // Telegram НЕ даёт полный список постов напрямую,
  // но мы можем ловить новые + предотвращать дубли
  console.log("Готово (будут добавляться новые посты)");
}

syncChannel();

// ловим новые посты
bot.on("channel_post", async (msg) => {
  if (!msg.audio) return;

  const track = {
  title: msg.audio.title || "Без названия",
  author: msg.audio.performer || "Unknown",
  file_id: msg.audio.file_id
  };

  const existing = (await axios.get(API)).data;

  if (exists(track.file_id, existing)) {
    console.log("Дубликат пропущен");
    return;
  }

  await axios.post(API, track);

  console.log("Добавлен новый трек:", track.title);
});