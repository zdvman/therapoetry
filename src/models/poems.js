// poems.js is a model for storing poems in MongoDB

import mongoose from "mongoose"; // Import Mongoose for interacting with MongoDB

// Schema for storing poems in MongoDB
const poemSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  deleteDate: {
    type: Date,
    default: () => new Date(+new Date() + 2 * 24 * 60 * 60 * 1000),
    required: true,
  },
  poems: [
    {
      language: { type: String, required: true },
      styleOfPoem: { type: String, required: true },
      prompt: { type: String, required: true },
      poem: { type: String, required: true },
      letters: { type: String, required: true }, // Добавлено для хранения выбранных букв
      ageGroup: { type: String, required: true }, // Добавлено для хранения возрастной группы
    },
  ],
});

const Poems = mongoose.model("Poems", poemSchema); // Create a model for storing poems in MongoDB

export default Poems; // Export the Poems model for use in other files
