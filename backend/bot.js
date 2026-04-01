const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID; // например @your_channel

const FILE = path.join(__dirname, "tracks.json");

const bot = new TelegramBot(TOKEN, { polling: true });

// --------------------
// загрузка базы
// --------------------
function loadTracks() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

// --------------------
// сохранение базы
// --------------------
function saveTracks(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// --------------------
// добавление трека с защитой от дублей
// --------------------
function addTrack(track) {
  const data = loadTracks();

  const exists = data.find(t => t.file_id === track.file_id);

  if (!exists) {
    data.push(track);
    saveTracks(data);
    console.log("➕ Новый трек добавлен:", track.title);
  } else {
    console.log("⚠️ Дубликат пропущен");
  }
}

// --------------------
// старт бота
// --------------------
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎵 Бот музыки работает!");
});

// --------------------
// обработка новых сообщений канала
// --------------------
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
    console.log("Ошибка обработки:", e);
  }
});

// --------------------
// ОДНОРАЗОВАЯ загрузка старых сообщений
// --------------------
let initialized = false;

async function loadHistory() {
  if (initialized) return;
  initialized = true;

  try {
    console.log("📥 Загружаем старые посты...");

    const updates = await bot.getUpdates();

    updates.forEach(u => {
      const msg = u.channel_post;
      if (!msg || (!msg.audio && !msg.document)) return;

      const file = msg.audio || msg.document;

      addTrack({
        title: file.title || "Без названия",
        file_id: file.file_id,
        duration: file.duration || 0,
        date: msg.date
      });
    });

    console.log("✅ История загружена");
  } catch (e) {
    console.log("Ошибка истории:", e);
  }
}

// запускаем историю один раз
loadHistory();

console.log("🤖 Bot started...");