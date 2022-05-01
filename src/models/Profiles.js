const {default: mongoose} = require("mongoose");
/*
 Коллекция используется для профилей пользователей. Задействовано в SurpriseCoins,
 списке людей которым можно использовать нестандартный шрифт.
 */

const Profiles = new mongoose.Schema({
    userId: String,
    guildId: String,
    IsUserCanUseCustomFontInNickname: Boolean,
});

module.exports = new mongoose.model("profiles", Profiles);