const express = require("express");
const fetch = require("node-fetch");
const app = express();

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxdCJfGLxKmvb0WVjEis4hNEeyTyHH2pF4DeAt2R4v_TYP9s_K75bao4SeDJy3ADS5wcw/exec";
const MODERATOR_ID = "56369189"; // your Twitch user ID

app.get("/love", async (req, res) => {
  const user = req.query.user || "Someone";
  const channel = req.query.channel;
  if (!channel) return res.status(400).send("Missing channel");

  const getRandomChatter = async () => {
    const apiUrl = `https://commands.garretcharp.com/twitch/chatter/${channel}?moderatorId=${MODERATOR_ID}`;
    try {
      const response = await fetch(apiUrl);
      return (await response.text()).trim().toLowerCase();
    } catch {
      return "unknown";
    }
  };

  const loved = await getRandomChatter();
  const married = await getRandomChatter();
  const killed = await getRandomChatter();
  const actualUser = user.toLowerCase();

  const postBody = { user: actualUser, loved, married, killed };

  console.log("Sending data to Google Sheets:", postBody);

  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postBody),
    });
    const text = await response.text();
    console.log("Google Sheets Response:", text);
  } catch (err) {
    console.error("Failed to POST to Google Sheets", err);
  }

  res.send(`${user} loves ${loved} lepSUSSY lepFLIRT marries ${married} lepLOVE and kills ${killed} lepW lepG`);
});

app.get("/lovestats", async (req, res) => {
  const user = req.query.user || req.query.caller || "unknown";
  const url = `${GOOGLE_SHEETS_URL}?user=${encodeURIComponent(user.toLowerCase())}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.send("Could not fetch stats. lepF");
  }
});

app.get("/bodycount", async (req, res) => {
  const caller = req.query.caller || req.query.user || "unknown";
  const target = req.query.bodycount || "";

  const url = `${GOOGLE_SHEETS_URL}?caller=${encodeURIComponent(caller.toLowerCase())}&bodycount=${encodeURIComponent(target.toLowerCase())}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.send("Could not fetch bodycount. lepF");
  }
});

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

app.get("/", (req, res) => {
  res.send("Nightbot !Love API is running 🤖");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
