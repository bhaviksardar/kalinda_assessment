require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

app.use(express.json());

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Sheet1";

// GET all rows
app.get("/api/data", async (req, res) => {
  console.log("GET /api/data called"); // debug
  try {
    const client = await auth.getClient();
    console.log("Google auth client created"); // debug
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:G`,
    });

    console.log("Data fetched from Sheets:", response.data.values, response.data);
    const allRows = response.data.values || [];

    const filteredRows = allRows.filter((row) => row[4] && row[4].trim() !== "");

    res.json(filteredRows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message });
  }
});

//GET Call Data
app.get("/api/data/:callId", async (req, res) => {
  const { callId } = req.params;

  console.log(`https://api.vapi.ai/v1/calls/${callId} called`); // debug

  try {
    const callRes = await fetch(
      `https://api.vapi.ai/call/${callId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Call metadata response status:", callRes); // debug

    if (!callRes.ok) {
      return res.status(callRes.status).json({ error: "Failed to fetch call metadata" });
    }

    const callData = await callRes.json();

  
    res.json({
      callId,
      status: callData.status,
      startedAt: callData.startedAt,
      endedAt: callData.endedAt,
      timestamp: callData.endedAt, 
      transcript: callData.transcript || [],
      number: callData.customer?.number || "",
    });

  } catch (error) {
    console.error("Error fetching VAPI data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//POST call
app.post("/api/call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber)
      return res.status(400).json({ error: "Missing phoneNumber" });

    const response = await axios.post(
      process.env.VAPI_API_URL,
      {
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const callId = response.data.id;
    let status = response.data.status;

    while (!["completed", "failed", "no-answer", "canceled"].includes(status)) {

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const statusRes = await axios.get(
        `https://api.vapi.ai/v1/calls/${callId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          },
        }
      );

      status = statusRes.data.status;
      console.log("Call status:", status);
    }

    if (status !== "completed") {
      return res.status(400).json({
        success: false,
        status,
        message: "Call did not complete successfully",
      });
    }

    return res.json({
      success: true,
      callId,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to make call" });
  }
});

//POST append to row
app.post("/api/data/append-call-meta", async (req, res) => {
  try {
    const { timestamp, transcript, number } = req.body;

    if (!timestamp || !transcript || !number) {
      return res.status(400).json({
        error: "timestamp, transcript, and number are required",
      });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const rows = getRes.data.values || [];

    if (rows.length === 0) {
      return res.status(400).json({
        error: "No existing rows found",
      });
    }

    const lastRowNumber = rows.length + 1; 

    const updateRes = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!E${lastRowNumber}:G${lastRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, transcript, number]],
      },
    });

    return res.json({
      success: true,
      updatedRow: lastRowNumber,
      updates: updateRes.data.updates,
    });

  } catch (err) {
    console.error("Error appending call metadata:", err);
    res.status(500).json({ error: err.message });
  }
});

//POST delete row
app.post("/api/data/delete", async (req, res) => {
  const { rowIndex } = req.body;

  console.log(`Request to delete row ${rowIndex} received`); // debug

  if (typeof rowIndex !== "number") {
    return res.status(400).json({ success: false, message: "rowIndex must be a number" });
  }

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Clear the entire row in the sheet
    const rangeToDelete = `${SHEET_NAME}!A${rowIndex}:G${rowIndex}`;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeToDelete,
    });

    console.log(`Deleted row ${rowIndex} in sheet`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting row:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

