import { Note } from "../../../../models/Note.js";

export const getAllNotes = async (_req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1, isPinned: -1 });
    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to fetch all notes",
      details: err.message,
    });
  }
};

// handler used in unprotected route
export const createNote = async (req, res) => {
  const {
    title,
    content,
    tags = [], // default empty array
    isPinned = false,
    userId,
  } = req.body;

  // basic validation
  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }
  if (!userId) {
    return res
      .status(400)
      .json({ error: true, message: "User ID is required" });
  }

  try {
    const note = await Note.create({
      title,
      content,
      tags,
      isPinned,
      userId,
    });

    return res.status(201).json({
      error: false,
      note,
      message: "Note created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to create note",
      details: err.message,
    });
  }
};

// handler used in protected route
export const addNote = async (req, res) => {
  const {
    title,
    content,
    tags = [], // default empty array
    isPinned = false,
  } = req.body;

  const { user } = req.user;
  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  if (!user || !user._id) {
    return res.status(400).json({ error: true, message: "Invalid user." });
  }

  try {
    const note = await Note.create({
      title,
      content,
      tags,
      isPinned,
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error in /add-note:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const editNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const togglePin = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note pinned status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const getUserNotes = async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const deleteUserNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const searchUserNotes = async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } }, // Case-insensitive title match
        { content: { $regex: new RegExp(query, "i") } }, // Case-insensitive content match
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
