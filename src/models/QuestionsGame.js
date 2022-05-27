const { default: mongoose } = require("mongoose");
// Коллекция вопросов и ответов в команде game.js
const QuestionsGameSchema = new mongoose.Schema({
  text: String, // Текст вопроса
  answers: [String], // Ответы на вопросы в массиве.
});

module.exports = mongoose.model("questions-game", QuestionsGameSchema);
