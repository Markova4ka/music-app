let tracks = [];
let currentTrack = 0;
let audio = new Audio();

const API = "https://music-app-gfga.onrender.com";

start();

async function start() {
  await wakeServer();
  await loadTracks();
}

// 🔥 пробуждение сервера
async function wakeServer() {
  try {
    await fetch(API + "/ping");
  } catch (e) {}
}

// 📥 загрузка треков
async function loadTracks() {
  const container = document.getElementById("tracks");

  container.innerHTML = "⏳ Загрузка...";

  try {
    const res = await fetch(API + "/tracks");
    const data = await res.json();

    console.log("TRACKS:", data);

    tracks = data || [];
    renderTracks(tracks);

  } catch (e) {
    console.log("LOAD ERROR:", e);
    container.innerHTML = "❌ Ошибка загрузки";
  }
}

// 🎨 рендер списка
function renderTracks(data) {
  const container = document.getElementById("tracks");

  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "Нет треков 😢";
    return;
  }

  data.forEach((track, index) => {
    const div = document.createElement("div");

    div.className = "track";
    div.innerText = track.title || "Без названия";

    div.onclick = () => playTrack(index);

    container.appendChild(div);
  });
}

// 🎧 play
async function playTrack(index) {
  currentTrack = index;

  const track = tracks[index];
  if (!track) return;

  try {
    const res = await fetch(API + "/audio/" + track.file_id);
    const data = await res.json();

    audio.src = data.url;
    await audio.play().catch(e => console.log("PLAY ERROR:", e));

    document.getElementById("trackTitle").innerText =
      track.title || "Без названия";

    document.getElementById("playBtn").innerText = "⏸️";

  } catch (e) {
    console.log("PLAY ERROR:", e);
  }
}

// ⏯ toggle
function togglePlay() {
  if (audio.paused) {
    audio.play();
    document.getElementById("playBtn").innerText = "⏸️";
  } else {
    audio.pause();
    document.getElementById("playBtn").innerText = "▶️";
  }
}

// ⏭ next
function nextTrack() {
  if (!tracks.length) return;
  currentTrack = (currentTrack + 1) % tracks.length;
  playTrack(currentTrack);
}

// ⏮ prev
function prevTrack() {
  if (!tracks.length) return;
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  playTrack(currentTrack);
}