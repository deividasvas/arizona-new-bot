const { default: mongoose, Schema } = require("mongoose");
// Коллекция пользователей Coins.
const CoinsUsersSchema = new mongoose.Schema({
    dateCreate: Date, // дата создания профиля
    guildId: String, // айди сервера, где находится пользователь
    userId: String, // айди пользователя
    coins: Number, // количество монет +
    sendEmojiAndStickersFromOtherServers: Schema.Types.Mixed, // возможность отправлять стикеры и эмодзи с других серверов
    isActiveCustomFontInNickname: Boolean, // возможность использовать нестандартный шрифт.
    platforms: Number, // количество платформ +
    lastDateTransfer: Schema.Types.Mixed, // дата последнего перевода. Date или null
    paidOfDay: Number, // количество денег которое передано за последний день +
    promocode: Schema.Types.Mixed, // Промокод который ввёл пользователь. String или null +
    depositCoins: Number, // количество денег на депозите +
    isDepositActive: Boolean, // активен депозит или нет +
    lastDateDayDepositInteraction: Schema.Types.Mixed, // Последняя дата снятия с депозита днём 25% от суммы депозита. null или Date
    lastDateWeekDepositInteraction: Schema.Types.Mixed, // Последняя дата снятия с депозита неделю 100% от суммы депозита. null или Date
    lastDateDayRefillDeposit: Schema.Types.Mixed, // Последняя дата пополнения депозита.
});

module.exports = mongoose.model("coins-users", CoinsUsersSchema);
