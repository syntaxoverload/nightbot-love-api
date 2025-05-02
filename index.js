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

  // Log the data being sent to Google Sheets
  console.log("Sending data to Google Sheets:", { loved, married, killed });

  // Send to Google Sheets
  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: JSON.stringify({ loved, married, killed }),
      headers: { "Content-Type": "application/json" },
    });

    // Log the response from Google Sheets
    const responseText = await response.text();
    console.log("Google Sheets Response:", responseText);
  } catch (error) {
    console.log("Error sending data to Google Sheets:", error);
  }

  const message = `${user} loves ${loved} lepFLIRT marries ${married} lepLOVE and kills ${killed} lepW lepG`;
  res.send(message);
});


// !lovestats
app.get("/lovestats", async (req, res) => {
  const queryUser = req.query.user || req.query.caller || "";
  const user = queryUser.toLowerCase().replace(/^@/, "");
  const url = `${GOOGLE_SHEETS_URL}?user=${encodeURIComponent(user)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.send("Could not fetch stats. lepF");
  }
});

// !bodycount
app.get("/bodycount", async (req, res) => {
  const queryUser = req.query.bodycount || req.query.user || req.query.caller || "";
  const user = queryUser.toLowerCase().replace(/^@/, "");
  const url = `${GOOGLE_SHEETS_URL}?bodycount=${encodeURIComponent(user)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.send("Could not fetch bodycount. lepF");
  }
});

// Leaderboards
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

app.get("/toplove", leaderboardHandler("love"));
app.get("/topmarry", leaderboardHandler("marry"));
app.get("/topkills", leaderboardHandler("kill"));

// Root check
app.get("/", (req, res) => {
  res.send("Nightbot !Love API is running 🤖");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));
