import express from "express";
import { Note } from "../../../models/Note.js";
import {
  getAllNotes,
  createNote,
  addNote,
  editNote,
  togglePin,
  getUserNotes,
  deleteUserNote,
  searchUserNotes,
} from "./controllers/notesController.js";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// ✅ Use these routes without auth
// 📋 GET ALL NOTES (regardless of user)
router.get("/notes", getAllNotes);

router.post("/notes", createNote);

// ❌ Use these routes after implimenting auth
// Add Note
router.post("/add-note", authUser, addNote);

// Edit Note
router.put("/edit-note/:noteId", authUser, editNote);

// Update isPinned
router.put("/update-note-pinned/:noteId", authUser, togglePin);

// Get all Notes by user
router.get("/get-all-notes", authUser, getUserNotes);

// Delete Note
router.delete("/delete-note/:noteId", authUser, deleteUserNote);

// Search Notes
router.get("/search-notes", authUser, searchUserNotes);

export default router;
