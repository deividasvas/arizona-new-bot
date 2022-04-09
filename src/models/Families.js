const { default: mongoose } = require("mongoose");

const FamilySchema = new mongoose.Schema({
    owner_id: String,
    deputies: [{ user_id: String }],
    role_id: String,
    voice_channel_id: String,
    text_channel_id: String,
});

module.exports = new mongoose.model("families", FamilySchema) // семейная коллекция.