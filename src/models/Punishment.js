const { default: mongoose } = require("mongoose");

// Коллекция в которой хранятся наказания.
const PunishmentSchema = new mongoose.Schema({
    action: String, // ban, mute, support-block
    moderatorId: String,
    userId: String,
    guildId: String,
    reason: String,
    dateEnd: Date, // дата конца наказания
});

module.exports = new mongoose.model("punishment", PunishmentSchema) // коллекция с наказаниями