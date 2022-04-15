const { EmbedBuilder } = require("discord.js");
const { channelsId } = require("../configs/settings");
const Punishment = require("../models/Punishment");

// Функция разблокировки пользователя.
const unban = async (bot, guildId, userId, provocateur = "-") => {
  const punish = await Punishment.findOne({
    action: "ban",
    userId,
    guildId,
  });
  if (!punish) {
    return;
  }
  const guild = bot.guilds.cache.get(punish.guildId);
  punish.remove();
  await guild.members.unban(userId, `Система снятия блокировки by ${provocateur}`);
};

module.exports = unban;
