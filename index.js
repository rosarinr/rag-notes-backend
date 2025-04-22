import express from "express";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();
const app = express();
app.use(express.json());

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize the notes table
(async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
         tags TEXT, -- JSON-encoded array of strings
    is_pinned INTEGER DEFAULT 0, -- 0 = false, 1 = true
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
})();

// CREATE a note
app.post("/notes", async (req, res) => {
  const { title, content, tags = [], is_pinned = false } = req.body;

  const result = await db.execute({
    sql: `
        INSERT INTO notes (title, content, tags, is_pinned)
        VALUES (?, ?, ?, ?)
      `,
    args: [title, content, JSON.stringify(tags), is_pinned ? 1 : 0],
  });

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    title,
    content,
    tags,
    is_pinned,
  });
});

// READ all notes
app.get("/notes", async (_req, res) => {
  const result = await db.execute("SELECT * FROM notes");
  const notes = result.rows.map((note) => ({
    ...note,
    tags: JSON.parse(note.tags || "[]"),
    is_pinned: Boolean(note.is_pinned),
  }));
  res.json(notes);
});

// READ a specific note
app.get("/notes/:id", async (req, res) => {
  const result = await db.execute({
    sql: "SELECT * FROM notes WHERE id = ?",
    args: [req.params.id],
  });

  if (result.rows.length === 0) {
    return res.status(404).send("Note not found");
  }

  const note = result.rows[0];

  res.json({
    ...note,
    tags: JSON.parse(note.tags || "[]"),
    is_pinned: Boolean(note.is_pinned),
  });
});

// UPDATE a note
app.put("/notes/:id", async (req, res) => {
  const { title, content, tags = [], is_pinned = false } = req.body;

  await db.execute({
    sql: `
        UPDATE notes
        SET title = ?, content = ?, tags = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    args: [
      title,
      content,
      JSON.stringify(tags),
      is_pinned ? 1 : 0,
      req.params.id,
    ],
  });

  res.send("Note updated");
});

// PATCH: update tags
app.patch("/notes/:id/tags", async (req, res) => {
  const { tags } = req.body;
  if (!Array.isArray(tags))
    return res.status(400).send("Tags must be an array");

  await db.execute({
    sql: `
        UPDATE notes
        SET tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    args: [JSON.stringify(tags), req.params.id],
  });

  res.send("Tags updated");
});

// PATCH: toggle is_pinned
app.patch("/notes/:id/pin", async (req, res) => {
  const result = await db.execute({
    sql: "SELECT is_pinned FROM notes WHERE id = ?",
    args: [req.params.id],
  });

  if (result.rows.length === 0) return res.status(404).send("Note not found");

  const current = result.rows[0].is_pinned;
  const toggled = current ? 0 : 1;

  await db.execute({
    sql: `
        UPDATE notes
        SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    args: [toggled, req.params.id],
  });

  res.send(`Note pin status set to ${!!toggled}`);
});

// DELETE a note
app.delete("/notes/:id", async (req, res) => {
  await db.execute({
    sql: "DELETE FROM notes WHERE id = ?",
    args: [req.params.id],
  });
  res.send("Note deleted");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT} ✅`)
);
