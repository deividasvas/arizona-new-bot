const { scheduleJob } = require("node-schedule");
const Punishment = require("../models/Punishment");
const unban = require("./unban");

const ban = async (bot, guildId, userId, provocateurId, days, reason) => {
  const punish = await Punishment.findOne({
    userId,
    action: "ban",
  });
  if (punish) {
    return null;
  }
  const guild = bot.guilds.cache.get(guildId);
  const provocateur = guild.members.cache.get(provocateurId);
  const dateEnd = new Date();
  await guild.members.cache.get(userId).ban({
    days,
    reason: `${reason} by ${provocateur.user.tag}`,
  });
  dateEnd.setDate(dateEnd.getDate() + days);
  const newPunish = new Punishment({
    action: "ban",
    moderatorId: provocateur.id,
    userId,
    guildId,
    reason,
    dateEnd,
  });
  newPunish.save();
  scheduleJob(`${guildId}-${userId}-mute-${reason}`, dateEnd, () => {
    unban(bot, guildId, userId); // ставим отслеживание на мут до определённое времени конца наказания.
    // снимаем мут как приходит время
  });
  return null;
};

module.exports = ban;
