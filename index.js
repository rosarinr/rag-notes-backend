import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "@libsql/client";
import apiRoutes from "./api/v1/routes.js";

dotenv.config();

const app = express();

app.use(express.json());

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  // Connect to MongoDB via Mongoose
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo database ✅");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
  // Ping Turso
  try {
    await db.execute("SELECT 1");
    console.log("Checked successful communication with Turso database ✅");
  } catch (err) {
    console.error("❌ Failed to connect to Turso:", err);
    process.exit(1);
  }
  // Initialize Turso tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
         tags TEXT, -- JSON-encoded array of strings
    is_pinned INTEGER DEFAULT 0, -- 0 = false, 1 = true
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);
})();

app.get("/", (req, res) => {
  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Notes API</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f7f9fc;
            color: #333;
            text-align: center;
            padding: 50px;
          }
          h1 {
            font-size: 2.5rem;
            color: #2c3e50;
          }
          p {
            font-size: 1.2rem;
            margin-top: 1rem;
          }
          code {
            background: #eee;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.95rem;
          }
          .container {
            max-width: 600px;
            margin: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📒 Welcome to the Notes API</h1>
          <p>This is a simple REST API built with <strong>Express</strong> and <strong>LibSQL</strong>.</p>
          <p>Try creating a note via <code>POST /notes</code> or explore routes like <code>/users</code> and <code>/notes-with-authors</code>.</p>
          <p>Use a REST client like <em>VSCode REST Client</em> or <em>Postman</em> to interact.</p>
          <p>✨ Happy coding!</p>
        </div>
      </body>
      </html>
    `);
});

app.use("/", apiRoutes(db));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT} ✅`)
);
