const { default: mongoose } = require("mongoose");

// Коллекция выключенных команд. Создана для работы cmd.js команды
const CommandsDisabledSchema = new mongoose.Schema({
    commandName: String,
    provocateurId: String,
    commandCategory: String,
});

module.exports = new mongoose.model("commands-disabled", CommandsDisabledSchema) // семейная коллекция.