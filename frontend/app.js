let tracks = [];
let currentTrack = 0;
let audio = new Audio();

const API = "https://music-app-gfga.onrender.com";

// запуск
start();

async function start() {
  await wakeServer();
  await loadTracks();
}

// 🔥 будим сервер (Render sleep fix)
async function wakeServer() {
  try {
    await fetch(API + "/ping");
  } catch (e) {
    console.log("Ping error:", e);
  }
}

// 📥 загрузка треков
async function loadTracks() {
  const container = document.getElementById("tracks");

  container.innerHTML = "⏳ Загрузка...";

  let tries = 0;

  while (tries < 10) {
    try {
      const res = await fetch(API + "/tracks");
      const data = await res.json();

      console.log("TRACKS:", data);

      if (data) {
        tracks = data;
        renderTracks(data);
        return;
      }
    } catch (e) {
      console.log("Load error:", e);
    }

    tries++;
    await new Promise(r => setTimeout(r, 2000));
  }

  container.innerHTML = "❌ Ошибка загрузки";
}

// 🎧 проигрывание
async function playTrack(index) {
  console.log("▶️ PLAY", index);

  currentTrack = index;
  const track = tracks[index];

  if (!track) return;

  try {
    const res = await fetch(API + "/audio/" + track.file_id);
    const data = await res.json();

    console.log("AUDIO URL:", data);

    audio.src = data.url;

    await audio.play().catch(e => console.log("PLAY ERROR:", e));

    document.getElementById("trackTitle").innerText = track.title || "Без названия";
    document.getElementById("playBtn").innerText = "⏸️";

  } catch (e) {
    console.log("Play error:", e);
  }
}

// ⏯ пауза / плей
function togglePlay() {
  if (audio.paused) {
    audio.play();
    document.getElementById("playBtn").innerText = "⏸️";
  } else {
    audio.pause();
    document.getElementById("playBtn").innerText = "▶️";
  }
}

// ⏭ следующий
function nextTrack() {
  if (!tracks.length) return;

  currentTrack = (currentTrack + 1) % tracks.length;
  playTrack(currentTrack);
}

// ⏮ предыдущий
function prevTrack() {
  if (!tracks.length) return;

  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  playTrack(currentTrack);
}

// 📋 рендер списка
function renderTracks(data) {
  const container = document.getElementById("tracks");

  container.innerHTML = "";

  data.forEach((track, index) => {
    const div = document.createElement("div");

    div.innerText = track.title || "Без названия";
    div.style.cursor = "pointer";
    div.style.padding = "10px";
    div.style.borderBottom = "1px solid #333";

    div.onclick = () => playTrack(index);

    container.appendChild(div);
  });
}