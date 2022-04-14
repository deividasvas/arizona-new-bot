const { default: mongoose } = require("mongoose");

const commandsDisabledSchema = new mongoose.Schema({
    commandName: String,
    provocateurId: String,
    commandCategory: String,
});

module.exports = new mongoose.model("commandsDisabled", commandsDisabledSchema) // семейная коллекция.