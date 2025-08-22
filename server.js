import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for GitHub Pages frontend
app.use(cors({
  origin: "https://syed-ali-06.github.io", // your frontend URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Preflight handler for OPTIONS
app.options("*", cors()); // allow all OPTIONS requests

// Test endpoint
app.get("/", (req, res) => {
  res.send("ytmp3 backend running 🚀");
});

// Download MP3
app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const ytdlp = spawn("yt-dlp", ["-x", "--audio-format", "mp3", "-o", "-", url]);

  res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");
  res.setHeader("Content-Type", "audio/mpeg");

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (data) => {
    console.error(`yt-dlp error: ${data}`);
  });

  ytdlp.on("close", (code) => {
    if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
