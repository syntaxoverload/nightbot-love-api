const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Google Sheets configuration
const GOOGLE_SHEET_ID = '1Ww5C1YaCT-9RJrU4QpJdCasNePqloJUgjzuUHZhmxm4';
const SHEET_NAME = 'Love Stat Tracker'; // Make sure this is the correct sheet name

// Express route for !lovestats
app.get("/lovestats", async (req, res) => {
  const username = req.query.user?.replace(/^@/, "").toLowerCase(); // Remove '@' if included

  if (!username || username.trim() === "") {
    return res.status(400).send("Please provide a username to check stats.");
  }

  // Fetching data from Google Sheets
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${SHEET_NAME}!A2:D?key=YOUR_GOOGLE_API_KEY`);
    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      return res.status(200).send(`${username} has not been caught yet.`);
    }

    const userStats = data.values.find((row) => row[0].toLowerCase() === username);

    if (!userStats) {
      return res.status(200).send(`${username} has not been caught yet.`);
    }

    const [_, loved, married, killed] = userStats;
    res.status(200).send(`${username} has been loved ${loved || 0} times, married ${married || 0} times, and killed ${killed || 0} times.`);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).send("There was an error retrieving the stats.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
