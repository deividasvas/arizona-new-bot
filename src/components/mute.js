const { Colors } = require("discord.js");
const { EmbedBuilder } = require("discord.js/node_modules/@discordjs/builders");
const { scheduleJob } = require("node-schedule");
const { rolesID, channelsID } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const convertMinutesToMs = require("./convertMinutesToMs");
const sendUserMessage = require("./sendUserMessage");
const unmute = require("./unmute");

const mute = async (bot, guildId, userId, provocateur, minutes, reason) => {
  const punish = await Punishment.findOne({
    userId,
  });
  if (punish?.action === "mute") {
    // если уже существует мут, то ничего не делаем
    if (punish.dateEnd <= new Date()) {
      // мут уже должен пройти, но мы выдадим новый
      punish.remove();
    } else {
      return null;
    }
  }
  const guild = bot.guilds.cache.get(guildId);
  const member =
    guild.members.cache.get(userId) || (await guild.members.fetch(userId));
  member.timeout(
    convertMinutesToMs(minutes),
    `${reason} by ${provocateur.user.tag}`
  );
  member.roles.add(rolesID.muted);
  const dateEnd = new Date();
  dateEnd.setMinutes(dateEnd.getMinutes() + minutes);
  const newPunish = new Punishment({
    action: "mute", // ban, mute, remove_role, unmmute, unmban, giveantitalone
    moderatorId: provocateur.id,
    userId,
    guildId: guild.id,
    reason,
    dateEnd,
  });
  newPunish.save();
  scheduleJob(`${guildId}-${userId}-mute-${reason}`, dateEnd, () => {
    unmute(bot, userId, "-"); // ставим отслеживание на мут до определённое времени конца наказания.
    const guild = bot.guilds.cache.get(guildId);
    const moderationLog = guild.channels.cache.get(channelsID.moderationLog); // канал куда отправляем сообщение о снятии мута
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система снятия мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Выдавал: <@${provocateur.id}>\n「📌」Кому: <@${userId}>\n 「📕」Причина выдачи мута: \`${reason}\`\n「📛」Мут снят!**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    }); // отправляем в этот канал сообщение о снятии мута

    sendUserMessage(
      {
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Система снятия мута!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Выдавал: <@${provocateur.id}>\n「📕」Причина: \`${reason}\`\n「📛」Мут снят!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      },
      userId,
      guild
    );
    // снимаем мут как приходит время
  });
  return true;
};

module.exports = mute;
