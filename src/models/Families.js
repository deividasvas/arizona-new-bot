const { default: mongoose } = require("mongoose");

// Коллекция в которой хранятся все семьи.
const FamilySchema = new mongoose.Schema({
    guildId: String,
    ownerId: String,
    deputies: [{ userId: String }],
    roleId: String,
    voiceChannelId: String,
    textChannelId: String,
    endDateFamilyPass: mongoose.Schema.Types.Mixed
});

module.exports = new mongoose.model("families", FamilySchema) // семейная коллекция.