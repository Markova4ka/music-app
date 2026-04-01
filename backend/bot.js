const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const FILE = path.join(__dirname, "tracks.json");

// =====================
// защита от двойного запуска
// =====================
if (global.botStarted) {
  console.log("⚠️ Bot already running, skip instance");
  return;
}
global.botStarted = true;

// =====================
// запуск бота (polling)
// =====================
const bot = new TelegramBot(TOKEN, { polling: true });

// =====================
// загрузка базы
// =====================
function loadTracks() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

// =====================
// сохранение базы
// =====================
function saveTracks(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// =====================
// добавление трека
// =====================
function addTrack(track) {
  const data = loadTracks();

  const exists = data.find(t => t.file_id === track.file_id);

  if (!exists) {
    data.push(track);
    saveTracks(data);
    console.log("➕ Новый трек:", track.title);
  } else {
    console.log("⚠️ Дубликат пропущен");
  }
}

// =====================
// /start
// =====================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎵 Бот музыки работает!");
});

// =====================
// новые посты из канала
// =====================
bot.on("channel_post", async (msg) => {
  try {
    if (!msg.audio && !msg.document) return;

    const file = msg.audio || msg.document;

    const track = {
      title: file.title || "Без названия",
      file_id: file.file_id,
      duration: file.duration || 0,
      date: msg.date
    };

    addTrack(track);

  } catch (e) {
    console.log("Ошибка channel_post:", e);
  }
});

// =====================
// лог запуска
// =====================
console.log("🤖 Bot started...");