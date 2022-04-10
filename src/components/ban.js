const { scheduleJob } = require("node-schedule");
const unban = require("./unban");

const ban = async (bot, guildId, userId, provocateur, days, reason) => {
  const punish = await Punishment.findOne({
    userId,
    action: "ban",
  });
  if (!punish) {
    return null;
  }
  await guild.members.fetch(userId).ban({
    days,
    reason: `${reason} by ${provocateur.user.tag}`,
  });
  const guild = bot.guild.cache.get(guildId);
  const dateEnd = new Date();
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
