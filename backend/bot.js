const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = "https://music-app-gfga.onrender.com";

const FILE = path.join(__dirname, "tracks.json");

const bot = new TelegramBot(TOKEN);

// =====================
// load / save
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

function addTrack(track) {
  const data = loadTracks();

  const exists = data.find(t => t.file_id === track.file_id);

  if (!exists) {
    data.push(track);
    saveTracks(data);
    console.log("➕ Новый трек:", track.title);
  }
}

// =====================
// webhook handler
// =====================
function handleUpdate(update) {
  try {
    const msg = update.channel_post;
    if (!msg) return;

    const file = msg.audio || msg.document;

    if (!file) return;

    addTrack({
      title: file.title || "Без названия",
      file_id: file.file_id,
      duration: file.duration || 0,
      date: msg.date
    });

  } catch (e) {
    console.log("Webhook error:", e);
  }
}

module.exports = { handleUpdate };

// =====================
// webhook setup
// =====================
bot.setWebHook(${WEBHOOK_URL}/webhook);

console.log("🌐 Webhook set:", ${WEBHOOK_URL}/webhook);