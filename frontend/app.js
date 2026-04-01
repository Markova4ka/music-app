let tracks = [];
let audio = new Audio();
let currentTrack = null;

const API = "https://music-app-gfga.onrender.com";

start();

async function start() {
  await wakeServer();
  await loadTracks();
}

// 🔥 wake server
async function wakeServer() {
  try {
    await fetch(API + "/ping");
  } catch (e) {}
}

// 📥 load tracks (НО НЕ РЕНДЕРИМ СПИСОК)
async function loadTracks() {
  try {
    const res = await fetch(API + "/tracks");
    tracks = await res.json();
  } catch (e) {
    console.log("LOAD ERROR:", e);
  }
}

// 🎲 RANDOM TRACK
function getRandomTrack() {
  if (!tracks.length) return null;

  const index = Math.floor(Math.random() * tracks.length);
  currentTrack = index;

  return tracks[index];
}

// ▶️ PLAY RANDOM
async function playRandom() {
  const track = getRandomTrack();
  if (!track) return;

  try {
    const res = await fetch(API + "/audio/" + track.file_id);
    const data = await res.json();

    audio.src = data.url;
    await audio.play();

    showNowPlaying(track);

  } catch (e) {
    console.log("PLAY ERROR:", e);
  }
}

// 🎧 show current track
function showNowPlaying(track) {
  document.getElementById("trackTitle").innerText =
    "🎧 Сейчас играет: " + (track.title || "Без названия");

  document.getElementById("trackAuthor").innerText =
    track.performer || "Unknown";
}

// ⏯ toggle
function togglePlay() {
  if (!audio.src) {
    playRandom();
    return;
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

// ⏭ next random
function nextTrack() {
  playRandom();
}

// =====================
// ⏱ TIMER / PROGRESS
// =====================
audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration || 0;

  document.getElementById("time").innerText =
    formatTime(current) + " / " + formatTime(duration);

  const percent = (current / duration) * 100;
  document.getElementById("progress").style.width = percent + "%";
});

function formatTime(sec) {
  if (!sec) return "0:00";

  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);

  return m + ":" + (s < 10 ? "0" + s : s);
}

// 🔥 autoplay next when ended
audio.addEventListener("ended", () => {
  playRandom();
});