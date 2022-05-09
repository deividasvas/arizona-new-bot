const {default: mongoose} = require("mongoose");
/*
 Коллекция используется для хранения информации о приватах на разных серверах.
 */

const Privates = new mongoose.Schema({
    authorId: String,
    guildId: String,
    channelId: String,
});

module.exports = new mongoose.model("privates", Privates);