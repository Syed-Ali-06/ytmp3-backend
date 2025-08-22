import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://syed-ali-06.github.io",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.options("*", cors());

app.get("/", (req,res) => res.send("ytmp3 backend running 🚀"));

app.post("/download", (req, res) => {
  const { url, cookies } = req.body;

  if (!url) return res.status(400).json({ error: "No URL provided" });

  // Unique temp filename
  const tempFile = path.join("/tmp", `audio_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.mp3`);

  // Build yt-dlp command
  let cmd = `yt-dlp -x --audio-format mp3 -o "${tempFile}" "${url}"`;

  // If cookies provided, add them
  if (cookies) {
    const cookieFile = path.join("/tmp", `cookies_${Date.now()}.txt`);
    fs.writeFileSync(cookieFile, cookies);
    cmd += ` --cookies "${cookieFile}"`;
  }

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: "Conversion failed", details: stderr });
    }

    // Send file to client
    res.download(tempFile, "audio.mp3", (err) => {
      if (err) console.error(err);
      fs.unlink(tempFile, () => {}); // delete temp file
    });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
