const { Colors } = require("discord.js");
const { scheduleJob } = require("node-schedule");
const { channelsId } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const unban = require("./unban");

/*
  Функция для выдачи блокировки пользователю. Используется в mban.js
*/

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
    unban(bot, guildId, userId); // ставим отслеживание на бан до определённое времени конца наказания.
    // снимаем бан как приходит время
    const bansLogsChannel = guild.channels.cache.get(channelsId.rolesAndBans);
    bansLogsChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система автоматической разблокировки!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Запрашивал: ${provocateur} \n「📌」Кому: <@${userId}>\n 「📕」Причина: \`${reason}\`\n「📛」Блокировка снята!**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  });
  return null;
};

module.exports = ban;
