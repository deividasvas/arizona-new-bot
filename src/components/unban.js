const Punishment = require("../models/Punishment");
const {cancelJob} = require("node-schedule");

// Функция разблокировки пользователя.
const unban = async (bot, guildId, userId, provocateur = "-", reason = "Система снятия блокировки") => {
    const punish = await Punishment.findOne({
        action: "ban",
        userId,
        guildId,
    });
    if (!punish) {
        return;
    }
    const guild = bot.guilds.cache.get(punish.guildId);

    await guild.bans.remove(userId, `${reason} by ${provocateur.displayName || provocateur.toString()}`);
    await Punishment.deleteOne({
        action: "ban",
        userId,
        guildId,
    });
    cancelJob(`${guildId}-${userId}-ban-${punish.reason}`); // отменяем автоматическое снятие наказания через модуль punishment.js
};

module.exports = unban;
