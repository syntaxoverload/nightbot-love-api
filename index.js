const express = require("express");
const fetch = require("node-fetch");
const app = express();

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxdCJfGLxKmvb0WVjEis4hNEeyTyHH2pF4DeAt2R4v_TYP9s_K75bao4SeDJy3ADS5wcw/exec";
const MODERATOR_ID = "56369189"; // your Twitch user ID

// !love command
app.get("/love", async (req, res) => {
  const user = req.query.user || "Someone";
  const channel = req.query.channel;
  if (!channel) return res.status(400).send("Missing channel");

  const getRandomChatter = async () => {
    const apiUrl = `https://commands.garretcharp.com/twitch/chatter/${channel}?moderatorId=${MODERATOR_ID}`;
    try {
      const response = await fetch(apiUrl);
      return (await response.text()).trim();
    } catch {
      return "Unknown";
    }
  };

  const loved = await getRandomChatter();
  const married = await getRandomChatter();
  const killed = await getRandomChatter();

  // Send to Google Sheets
  fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    body: JSON.stringify({ loved, married, killed }),
    headers: { "Content-Type": "application/json" },
  });

  const message = `${user} loves ${loved} lepFLIRT marries ${married} lepLOVE and kills ${killed} lepW lepG`;
  res.send(message);
});

// Root check
app.get("/", (req, res) => {
  res.send("Nightbot !Love API is running 🤖");
});

// !lovestats command
app.get("/lovestats", async (req, res) => {
  const user = req.query.user;
  const nightbotUser = req.query["user"] || req.query["caller"]; // fallback for Nightbot default
  const actualUser = (user || nightbotUser || "unknown").toLowerCase();

  const url = `${GOOGLE_SHEETS_URL}?user=${encodeURIComponent(actualUser)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.send("Could not fetch stats. lepF");
  }
});

// Leaderboard helper
const leaderboardHandler = (type) => async (req, res) => {
  const n = Math.min(parseInt(req.query.n) || 1, 5);
  const url = `${GOOGLE_SHEETS_URL}?leaderboard=${type}&n=${n}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.send(`Could not fetch top ${type} leaderboard. lepF`);
  }
};

// !toplove, !topmarry, !topkills
app.get("/toplove", leaderboardHandler("love"));
app.get("/topmarry", leaderboardHandler("marry"));
app.get("/topkills", leaderboardHandler("kill"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));
