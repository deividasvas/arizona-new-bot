const { default: mongoose } = require("mongoose");
// Коллекция с промокодами от системы Coins.
const PromocodesSchema = new mongoose.Schema({
    guildId: String, // айди сервера, где находится пользователь
    name: String, // название промокода
    use: Number, // количество использовании
    authorId: String, // айди автора
});

module.exports = mongoose.model("promocodes", PromocodesSchema);
