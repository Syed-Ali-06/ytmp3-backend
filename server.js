import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

  const command = `yt-dlp -x --audio-format mp3 -o - "${url}"`;

  const process = exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error) => {
    if (error) {
      console.error("yt-dlp error:", error);
      return res.status(500).json({ error: "Download failed" });
    }
  });

  res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");
  res.setHeader("Content-Type", "audio/mpeg");

  process.stdout.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
