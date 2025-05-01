// index.js
const express = require("express");
const fetch = require("node-fetch");
const app = express();

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxdCJfGLxKmvb0WVjEis4hNEeyTyHH2pF4DeAt2R4v_TYP9s_K75bao4SeDJy3ADS5wcw/exec";
const MODERATOR_ID = "56369189"; // your Twitch user ID

app.get("/love", async (req, res) => {
  const user = req.query.user || "Someone";
  const channel = req.query.channel;

  if (!channel) {
    return res.status(400).send("Missing channel");
  }

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

  // Send to Google Sheets (via Google Apps Script URL)
  fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    body: JSON.stringify({ loved, married, killed }),
    headers: { "Content-Type": "application/json" },
  });

  const message = `${user} loves ${loved} lepFLIRT, marries ${married} lepLOVE, and kills ${killed} lepW lepG`;
  res.send(message);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));

app.get("/", (req, res) => {
  res.send("Nightbot !Love API is running 🤖");
});

// /lovestats route to fetch data from Google Sheets via Google Apps Script
app.get("/lovestats", async (req, res) => {
  const user = req.query.user?.replace(/^@/, "").toLowerCase(); // Remove the '@' if included
  const actor = req.query.actor?.toLowerCase() || user;  // Default to the 'user' if actor is not provided

  if (!user || user.trim() === "") {
    return res.status(200).send(`${actor}, please provide a name to check stats! lepSTARE`);
  }

  try {
    // Fetch data from Google Sheets (Google Apps Script URL)
    const response = await fetch(`${GOOGLE_SHEETS_URL}?user=${user}`);
    
    // Check if the response is valid JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();  // Read the response as text if it's not JSON
      return res.status(500).send(`Error: The response from the Google Sheets API is not in JSON format. Received: ${text}`);
    }

    // Parse the valid JSON response
    const data = await response.json();

    if (!data || data.error) {
      return res.status(200).send(`${user} has not been caught yet. lepHANDS`);
    }

    const { loved, married, killed } = data;

    return res.status(200).send(`${user} has been loved lepFLIRT ${loved || 0} times, married lepLOVE ${married || 0} times, and killed lepW lepG ${killed || 0} times.`);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).send("Something went wrong retrieving stats.");
  }
});
