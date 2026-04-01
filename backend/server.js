const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

// ❗ ВАЖНО: webhook режим (НЕ polling)
const bot = new TelegramBot(TOKEN);

// -------------------
// WEBHOOK ROUTE (ЭТОГО У ТЕБЯ НЕ ХВАТАЛО)
// -------------------
app.post("/webhook", (req, res) => {
  try {
    console.log("🔥 webhook received");

    const update = req.body;

    const msg = update.channel_post;
    if (!msg) return res.sendStatus(200);

    const file = msg.audio || msg.document;

    if (!file) return res.sendStatus(200);

    const tracks = loadTracks();

    const track = {
      title: file.title || "Без названия",
      file_id: file.file_id,
      duration: file.duration || 0,
      date: msg.date
    };

    const exists = tracks.find(t => t.file_id === track.file_id);

    if (!exists) {
      tracks.push(track);
      saveTracks(tracks);
      console.log("➕ NEW TRACK:", track.title);
    }

    res.sendStatus(200);
  } catch (e) {
    console.log("WEBHOOK ERROR:", e);
    res.sendStatus(200);
  }
});