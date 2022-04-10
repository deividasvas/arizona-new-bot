const { default: mongoose } = require("mongoose");

const PunishmentSchema = new mongoose.Schema({
    action: String, // ban, mute, remove_role, unmmute, unmban, giveantitalone
    moderatorId: String,
    userId: String,
    guildId: String,
    reason: String,
    dateEnd: Date,
});

module.exports = new mongoose.model("punishment", PunishmentSchema) // коллекция с наказаниями