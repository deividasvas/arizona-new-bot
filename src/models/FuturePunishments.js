const { default: mongoose } = require("mongoose");

// Коллекция в которой хранятся все наказания которые нужно будет выдать, но чуть чуть позже.
const FuturePunishmentsSchema = new mongoose.Schema({
  action: String, // ban, mute. Действие которое будут применено к пользователю от лица модератора.
  moderatorId: String,
  userId: String,
  guildId: String,
  reason: String,
  timeInMs: Number, // время в миллисекундах на которое нужно выдать наказание пользователю.
});

module.exports = new mongoose.model(
  "futuresPunishments",
  FuturePunishmentsSchema
); // семейная коллекция.
