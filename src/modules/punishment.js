const { Colors, EmbedBuilder } = require("discord.js");
const { scheduleJob } = require("node-schedule");
const unban = require("../components/unban");
const unmute = require("../components/unmute");
const { channelsId } = require("../configs/settings");
const Punishment = require("../models/Punishment");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того чтобы снимать наказания когда приходит время.
  */
  name: "punishment", // имя модуля
  acceptCustomsID: [], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

    const bans = await Punishment.find({
      action: "ban",
    });
    const mutes = await Punishment.find({
      action: "mutes",
    });

    for (const ban of bans) {
      const guild = bot.guilds.cache.get(ban.guildId);
      const banesChannel = guild.channels.cache.get(channelsId.rolesAndBans); // роли-баны. Канал куда будет кидаться эмбед снятия бана
      if (ban.dateEnd <= new Date()) {
        // проверяем прошло ли время конца наказания пользователя

        banesChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.DarkGreen)
              .setTitle(`📌 | Система снятия блокировки!`)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setDescription(
                `**「📝」Выдавал: <@${ban.moderatorId}>\n「📌」Кому: <@${ban.userId}>\n 「📕」Причина: \`${ban.reason}\`\n「📛」Блокировка снята!**`
              )
              .setTimestamp()
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
        });
        return unban(bot, ban.guildId, ban.userId, "-"); // если прошло, то снимаем наказание
      }
      scheduleJob(
        `${ban.guildId}-${ban.userId}-mute-${ban.reason}`,
        ban.dateEnd,
        () => {
          if (
            !Punishment.findOne({
              ...ban,
            })
          ) {
            // проверяем, существует ли бан. Если нет, то ничего не делаем.
            return;
          }
          // ставим отслеживание на бан до определённое времени конца наказания.
          unban(bot, ban.guildId, ban.userId); // снимем бан как приходит время
          banesChannel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Система снятия блокировки!`)
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setDescription(
                  `**「📝」Выдавал: <@${ban.moderatorId}>\n「📌」Кому: <@${member.id}>\n 「📕」Причина: \`${reason}\`\n「📛」Блокировка снята!**`
                )
                .setTimestamp()
                .setFooter({
                  text: `Robo Hamster`,
                  iconURL: bot.user.displayAvatarURL(),
                }),
            ],
          });
        }
      );
    }

    for (const mute of mutes) {
      if (mute.dateEnd <= new Date()) {
        // проверяем прошло ли время конца наказания пользователя
        return unmute(bot, mute.userId, "-"); // если прошло, то снимаем наказание
      }
      scheduleJob(
        `${mute.guildId}-${mute.userId}-mute-${mute.reason}`,
        mute.dateEnd,
        () => {
          if (
            !Punishment.findOne({
              ...mute,
            })
          ) {
            // проверяем, существует ли мут. Если нет, то ничего не делаем.
            return;
          }
          unmute(bot, mute.userId, "-"); // ставим отслеживание на мут до определённое времени конца наказания.
          // снимаем мут как приходит время
          const guild = bot.guilds.cache.get(mute.guildId);
          const moderationLog = guild.channels.cache.get(
            channelsId.moderationLog
          ); // канал куда отправляем сообщение о снятии мута
          const member = guild.members.cache.get(mute.userId);
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
                  `**「📝」Выдавал: <@${mute.moderatorId}>\n「📌」Кому: <@${member.id}>\n 「📕」Причина выдачи мута: \`${mute.reason}\`\n「📛」Мут снят!**`
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
                  .setColor("DarkGreen")
                  .setTitle(`📌 | Система снятия мута!`)
                  .setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL(),
                  })
                  .setDescription(
                    `**「📝」Выдавал: <@${mute.moderator_id}>\n「📕」Причина: \`${mute.reason}\`\n「📛」Мут снят!**`
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Robo Hamster`,
                    iconURL: bot.user.displayAvatarURL(),
                  }),
              ],
            },
            userForUnmute.id,
            guild
          );
        }
      );
    }
  },
};
