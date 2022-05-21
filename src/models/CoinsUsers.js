const { default: mongoose } = require("mongoose");
// Коллекция пользователей Coins.
const CoinsUsersSchema = new mongoose.Schema({
    dateCreate: Date, // дата создания профиля
    guildId: String, // айди сервера, где находится пользователь
    userId: String, // айди пользователя
    coins: Number, // количество монет
    IsUserCanUseCustomFontInNickname: Boolean, // может ли этот пользователь использовать нестандартный шрифт
    platforms: Number, // количество платформ
    lastDateTransfer: Date, // дата последнего перевода
    paidOfDay: Number, // количество денег которое передано за последний день
    promocode: {
        name: String,
        dateActivate: Date,
        activate: Boolean,
    }, // промокод который ввёл пользователь
});

module.exports = mongoose.model("coins-users", CoinsUsersSchema);
