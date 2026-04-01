const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const FILE = "./tracks.json";

// -------------------
// load/save
// -------------------
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

// -------------------
app.get("/ping", (req, res) => {
  res.send("pong");
});

// -------------------
app.get("/tracks", (req, res) => {
  res.json(loadTracks());
});

// -------------------
app.post("/addTrack", (req, res) => {
  const tracks = loadTracks();

  tracks.push(req.body);

  saveTracks(tracks);

  console.log("➕ track saved:", req.body);

  res.json({ ok: true });
});

// -------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on", PORT);
});