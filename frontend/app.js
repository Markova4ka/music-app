let tracks = [];
let currentTrack = 0;
let audio = new Audio();

// 👉 один BASE URL (очень важно)
const API = "https://music-app-gfga.onrender.com";

await wakeServer();
loadTracks();

async function wakeServer() {
  try {
    await fetch(`${API}/ping`);
  } catch (e) {}
}

async function loadTracks() {
  const container = document.getElementById("tracks");

  container.innerHTML = "⏳ Загрузка...";

  let tries = 0;

  while (tries < 10) {
    try {
      const res = await fetch(`${API}/tracks`);
      const data = await res.json();

      if (data) {
        tracks = data; // 🔥 ВАЖНО (у тебя этого не было)
        renderTracks(data);
        return;
      }
    } catch (e) {}

    tries++;
    await new Promise(r => setTimeout(r, 2000));
  }

  container.innerHTML = "❌ Ошибка загрузки";
}

async function playTrack(index) {
  currentTrack = index;

  const track = tracks[index];

  const res = await fetch(`${API}/audio/${track.file_id}`);
  const data = await res.json();

  audio.src = data.url;
  audio.play();

  document.getElementById("trackTitle").innerText = track.title;
  document.getElementById("playBtn").innerText = "⏸️";
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
    document.getElementById("playBtn").innerText = "⏸️";
  } else {
    audio.pause();
    document.getElementById("playBtn").innerText = "▶️";
  }
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  playTrack(currentTrack);
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  playTrack(currentTrack);
}

loadTracks();