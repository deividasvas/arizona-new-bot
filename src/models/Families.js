const { default: mongoose } = require("mongoose");

// Коллекция в которой хранятся все семьи.
const FamilySchema = new mongoose.Schema({
    ownerId: String,
    deputies: [{ userId: String }],
    roleId: String,
    voiceChannelId: String,
    textChannelId: String,
});

module.exports = new mongoose.model("families", FamilySchema) // семейная коллекция.