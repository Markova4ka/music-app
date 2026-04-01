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

// 📥 load tracks
async function loadTracks() {
  try {
    const res = await fetch(API + "/tracks");
    tracks = await res.json();
  } catch (e) {
    console.log("LOAD ERROR:", e);
  }
}

// 🎲 random track
function getRandomTrack() {
  if (!tracks.length) return null;

  const index = Math.floor(Math.random() * tracks.length);
  currentTrack = index;

  return tracks[index];
}

// ▶️ play random track
async function playRandom() {
  const track = getRandomTrack();
  if (!track) return;

  await playTrack(track);
}

// ▶️ play selected track
async function playTrack(track) {
  try {
    const res = await fetch(API + "/audio/" + track.file_id);
    const data = await res.json();

    audio.src = data.url;
    await audio.play();

    updateUI(track);

  } catch (e) {
    console.log("PLAY ERROR:", e);
  }
}

// 🎧 update UI
function updateUI(track) {
  document.getElementById("trackTitle").innerText =
    track.title || "Без названия";

  document.getElementById("trackAuthor").innerText =
    track.performer || "Unknown";
}

// ▶️ / ⏸ toggle
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

// ⏭ next
function nextTrack() {
  playRandom();
}

// ⏮ prev (пока random)
function prevTrack() {
  playRandom();
}

// =====================
// ⏱ PROGRESS BAR + TIMER
// =====================
audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration || 0;

  const percent = duration ? (current / duration) * 100 : 0;

  // 📊 progress line
  const progress = document.getElementById("progress");
  if (progress) progress.style.width = percent + "%";

  // 🎯 dot
  const dot = document.getElementById("dot");
  if (dot) dot.style.left = percent + "%";

  // ⏱ time text
  const currentTime = document.getElementById("currentTime");
  const durationTime = document.getElementById("duration");

  if (currentTime) currentTime.innerText = formatTime(current);
  if (durationTime) durationTime.innerText = formatTime(duration);
});

// 🎯 seek (перемотка)
function seek(event) {
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();

  const percent = (event.clientX - rect.left) / rect.width;

  if (audio.duration) {
    audio.currentTime = percent * audio.duration;
  }
}

// 🔥 autoplay next
audio.addEventListener("ended", () => {
  playRandom();
});

// ⏱ format time
function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";

  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);

  return m + ":" + (s < 10 ? "0" + s : s);
}