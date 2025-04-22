## 🔧 1. **Creating the Notes Table**

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  is_pinned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Explanation:

- `CREATE TABLE IF NOT EXISTS`: This creates the table **only if it doesn’t already exist**.
- `id INTEGER PRIMARY KEY AUTOINCREMENT`: A unique ID is automatically assigned to each note. It counts up automatically (1, 2, 3...).
- `title TEXT NOT NULL`: The title must be text, and **cannot be empty** (`NOT NULL`).
- `content TEXT NOT NULL`: Same as title — must contain something.
- `tags TEXT`: This will store an **array of tags**, but stored as a **JSON string** (like `["personal","work"]`).
- `is_pinned INTEGER DEFAULT 0`: This stores either `0` (false) or `1` (true). The default is **not pinned**.
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`: Automatically sets the **current time** when the note is created.
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`: Same as above — and we update this manually whenever a note is changed.

---

## 📝 2. Inserting a Note (`POST /notes`)

```sql
INSERT INTO notes (title, content, tags, is_pinned)
VALUES (?, ?, ?, ?)
```

### Explanation:

- `INSERT INTO notes (...)`: Adds a **new row** to the `notes` table.
- `VALUES (?, ?, ?, ?)`: These `?`s are placeholders for:
  - `title` (text)
  - `content` (text)
  - `tags` (converted to a string using `JSON.stringify(tags)`)
  - `is_pinned` (converted to `0` or `1`)

This creates a full note in the database.

---

## 📖 3. Retrieving Notes (`GET /notes`, `GET /notes/:id`)

```sql
SELECT * FROM notes
```

or:

```sql
SELECT * FROM notes WHERE id = ?
```

### Explanation:

- `SELECT *`: Fetches **all columns**.
- `WHERE id = ?`: Filters by a specific note’s ID.

Then you:

- Convert `tags` from string to array with `JSON.parse(...)`
- Convert `is_pinned` from `0/1` to `true/false`

---

## ✏️ 4. Updating a Note (`PUT /notes/:id`)

```sql
UPDATE notes
SET title = ?, content = ?, tags = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?
```

### Explanation:

- `UPDATE notes`: Change an existing row.
- `SET ...`: Set new values for each field.
- `updated_at = CURRENT_TIMESTAMP`: Updates the modified date.
- `WHERE id = ?`: Only update the note with this ID.

---

## 🏷️ 5. Updating Just Tags (`PATCH /notes/:id/tags`)

```sql
UPDATE notes
SET tags = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?
```

### Explanation:

You’re only updating the `tags` field here, and refreshing the `updated_at` timestamp.

---

## 📌 6. Toggling Pinned Status (`PATCH /notes/:id/pin`)

```sql
SELECT is_pinned FROM notes WHERE id = ?
```

→ read current value, then:

```sql
UPDATE notes
SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?
```

### Explanation:

- You **read the current pin status**, reverse it (`0` → `1` or `1` → `0`), then save the new status.

---

## 🗑️ 7. Deleting a Note (`DELETE /notes/:id`)

```sql
DELETE FROM notes WHERE id = ?
```

### Explanation:

- `DELETE FROM notes`: Completely removes a row.
- `WHERE id = ?`: Only delete the note with the given ID.

---

## ✅ Summary for Beginners:

| SQL Keyword    | What it does                           |
| -------------- | -------------------------------------- |
| `CREATE TABLE` | Makes a new table (like a spreadsheet) |
| `INSERT INTO`  | Adds a new row (a note)                |
| `SELECT`       | Reads notes from the table             |
| `UPDATE`       | Edits an existing note                 |
| `DELETE`       | Removes a note completely              |
| `WHERE`        | Filters by something (like ID)         |

---
