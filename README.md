## 🗄️ **1. Table Initialization – SQL Overview**

### 🔸 Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
```

**Explanation:**

- `CREATE TABLE IF NOT EXISTS`: Creates a new table, but only if it doesn’t already exist (prevents errors).
- `id INTEGER PRIMARY KEY AUTOINCREMENT`: Each user gets a unique ID that automatically increases.
- `name TEXT NOT NULL`: Name must be provided.
- `email TEXT UNIQUE NOT NULL`: Email must be unique and cannot be empty.

---

### 🔸 Notes Table

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  is_pinned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER
);
```

**Explanation:**

- `tags TEXT`: Stores an array of tags in JSON string format.
- `is_pinned INTEGER DEFAULT 0`: Treated as a boolean. `0` means false, `1` means true.
- `created_at` / `updated_at`: Auto-filled with the current time.
- `user_id INTEGER`: Connects this note to a user (foreign key-style relationship).

---

## 🔧 2. CRUD Routes & Their SQL Logic

---

### ✅ Create a User

```sql
INSERT INTO users (name, email) VALUES (?, ?);
```

- Adds a new user to the database.
- `?` placeholders are replaced by actual values (`name`, `email`).

---

### ✅ Create a Note

```sql
INSERT INTO notes (title, content, tags, is_pinned, user_id)
VALUES (?, ?, ?, ?, ?);
```

- Adds a new note to the `notes` table.
- Tags are converted to a JSON string before saving.
- `is_pinned` is stored as `0` or `1`.

---

### ✅ Get All Notes

```sql
SELECT * FROM notes;
```

- Retrieves all notes from the database.
- You then parse the `tags` field back into an array using `JSON.parse()` and convert `is_pinned` to a boolean.

---

### ✅ Get a Note by ID

```sql
SELECT * FROM notes WHERE id = ?;
```

- Returns one note that matches the provided `id`.

---

### ✅ Get Notes with Author Info

```sql
SELECT notes.*, users.name as author_name, users.email as author_email
FROM notes
INNER JOIN users ON notes.user_id = users.id
ORDER BY notes.created_at DESC;
```

- This is a **JOIN**: it combines data from both `notes` and `users` where `user_id` matches `users.id`.
- Adds `author_name` and `author_email` fields to each note result.

---

### ✅ Get All Notes by One User

```sql
SELECT * FROM notes
WHERE user_id = ?
ORDER BY created_at DESC;
```

- Fetches notes written by a specific user using their `user_id`.

---

### ✏️ Update a Note

```sql
UPDATE notes
SET title = ?, content = ?, tags = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

- Updates all main fields of a note.
- Also updates the `updated_at` timestamp automatically.

---

### 🏷️ Update Tags Only

```sql
UPDATE notes
SET tags = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

- Just updates the `tags` field (useful for patching).

---

### 📌 Toggle Pin

```sql
SELECT is_pinned FROM notes WHERE id = ?;
```

- First, check the current pin status.

Then:

```sql
UPDATE notes
SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

- Flip the value of `is_pinned`.

---

### ❌ Delete a Note

```sql
DELETE FROM notes WHERE id = ?;
```

- Removes the note with the specified ID from the database.

---

## 🧠 Concepts You're Applying (for Beginners)

| SQL Feature     | Where You Used It               | What It Does                                       |
| --------------- | ------------------------------- | -------------------------------------------------- |
| `CREATE TABLE`  | Setup code                      | Defines tables and columns                         |
| `INSERT INTO`   | `POST /users`, `POST /notes`    | Adds new rows (users, notes)                       |
| `SELECT`        | `GET` routes                    | Fetches rows (all notes, notes with authors, etc.) |
| `INNER JOIN`    | `GET /notes-with-authors`       | Combines data from 2 tables (notes + users)        |
| `UPDATE`        | `PUT`, `PATCH` routes           | Edits specific fields in existing rows             |
| `DELETE`        | `DELETE /notes/:id`             | Removes data                                       |
| `WHERE`         | Many routes                     | Filters rows based on a condition (e.g. ID match)  |
| `DEFAULT`       | `is_pinned`, `created_at`, etc. | Automatically assigns values if not provided       |
| `AUTOINCREMENT` | `id` fields                     | Automatically increases ID value for new entries   |

---

api/
├── v1/
│ ├── routes.js
│ └── users.js
│ └── notes.js
└── server.js
