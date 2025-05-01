// index.js
const express = require("express");
const fetch = require("node-fetch");
const { google } = require('googleapis');
const app = express();

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxdCJfGLxKmvb0WVjEis4hNEeyTyHH2pF4DeAt2R4v_TYP9s_K75bao4SeDJy3ADS5wcw/exec";  // Your Apps Script URL
const MODERATOR_ID = "56369189";  // your Twitch user ID

const sheets = google.sheets({ version: 'v4' });
const SPREADSHEET_ID = '1Ww5C1YaCT-9RJrU4QpJdCasNePqloJUgjzuUHZhmxm4';  // Your Spreadsheet ID
const SHEET_NAME = 'Love Stat Tracker';  // Your Sheet Name

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

  // Send to Google Sheets
  fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    body: JSON.stringify({ loved, married, killed }),
    headers: { "Content-Type": "application/json" },
  });

  const message = `${user} loves ${loved} lepFLIRT, marries ${married} lepLOVE, and kills ${killed} lepW lepG`;
  res.send(message);
});

app.get("/lovestats", async (req, res) => {
  const user = req.query.user?.replace(/^@/, "").toLowerCase();
  const actor = req.query.actor?.toLowerCase();

  if (!user || user.trim() === "") {
    return res.status(200).send(`${actor}, please provide a name to check stats! lepSTARE`);
  }

  try {
    // Read the whole sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`, // Assumes headers are in row 1
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).send(`${user} has not been caught yet. lepHANDS`);
    }

    const found = rows.find(r => r[0]?.toLowerCase() === user);

    if (!found) {
      return res.status(200).send(`${user} has not been caught yet. lepHANDS`);
    }

    const [_, loved, married, killed] = found;

    return res.status(200).send(`${user} has been loved lepFLIRT ${loved || 0} times, married lepLOVE ${married || 0} times, and killed lepW lepG ${killed || 0} times.`);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).send("Something went wrong retrieving stats.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
