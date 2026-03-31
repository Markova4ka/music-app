let tracks = [];
let currentTrack = 0;
let audio = new Audio();

async function loadTracks() {
  const res = await fetch("http://localhost:3000/tracks");
  tracks = await res.json();

  const list = document.querySelector(".list");
  list.innerHTML = "";

  tracks.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "track";
    div.innerText = `${i + 1}. ${t.title}`;
    div.onclick = () => playTrack(i);
    list.appendChild(div);
  });
}

async function playTrack(index) {
  currentTrack = index;

  const track = tracks[index];

  // получаем ссылку на аудио
  const res = await fetch(
    `http://localhost:3000/audio/${track.file_id}`
  );
  const data = await res.json();

  audio.src = data.url;
  audio.play();

  document.getElementById("trackTitle").innerText = track.title;
  document.getElementById("playBtn").innerText = "⏸";
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
    document.getElementById("playBtn").innerText = "⏸";
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