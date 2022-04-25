const { EmbedBuilder, Colors } = require("discord.js");
const ban = require("../components/ban");
const getAllRolesIdModers = require("../components/getAllRolesIdModers");
const getDaysInMs = require("../components/getDaysInMs");
const parseUserIdFromMention = require("../components/parseUserId");
const sendUserMessage = require("../components/sendUserMessage");
const setModerInfoParam = require("../components/setModerInfoParam");
const settings = require("../configs/settings");
const { rolesId, channelsId } = require("../configs/settings");
const BansVotes = require("../models/BansVotes");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы обработать кнопки эмбедов банов у модераторов.
  */
  name: "bans", // имя модуля
  acceptCustomsID: ["banYes", "banNo"], // модуль автоматически принимает эти айдишники interaction.customId
  async banUser(bot, interaction, userId, days, reason, moderatorId) {
    await BansVotes.deleteOne({
      moderatorSenderId: moderatorId,
      userForBanId: userId,
    });

    const bansLogsChannel = interaction.guild.channels.cache.get(
      channelsId.rolesAndBans
    ); // канал куда отправляются логи банов
    await bansLogsChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Система блокировки пользователей!`)
          .setColor(Colors.Red)
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          })
          .setDescription(
            `**「📝」Запросил бан: <@${moderatorId}>\n「📌」Кому: <@${userId}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    await sendUserMessage(
      {
        content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Вам выдали блокировку!`)
            .setAuthor({
              name: interaction.guild.name,
              iconURL: interaction.guild.iconURL(),
            })
            .setDescription(
              `**「📝」Выдал бан: <@${moderatorId}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      },
      userId,
      interaction.guild
    );
    await ban(bot, interaction.guildId, userId, moderatorId, days, reason);
    this.giveBalls(moderatorId, interaction.guildId);
  },
  async giveBalls(moderatorId, guildId) {
    // выдаем недельные баны и общие
    await setModerInfoParam(
      moderatorId,
      guildId,
      "main",
      "bans",
      ({ bans }) => bans + 1
    );
    await setModerInfoParam(
      moderatorId,
      guildId,
      "week",
      "bans",
      ({ bans }) => bans + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
      moderatorId,
      guildId,
      "main",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.ban * coefficient
    );
    await setModerInfoParam(
      moderatorId,
      guildId,
      "week",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.ban * coefficient
    );
  },
  async run({ bot, interaction, member: user, guild }) {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

    if (
      !user.roles.cache.find((role) => getAllRolesIdModers().includes(role.id))
    ) {
      // если у пользователя который нажал на кнопку нет модерских ролей, то отдаём ошибку
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не являетесь модератором. Если это не так, то обратитесь к <@&${rolesId.techSection}>**`
            )
            .setColor(Colors.Red)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    const rows = interaction.message.embeds[0].fields[0].value.split("\n");
    const getValue = (index) => rows[index].split(":")[1].trimStart().slice(2); // функция которая отдаёт значение из колонок
    /*
    Колонки под которые это всё строилось(пример):
     value: `>>> \`Отправитель:\` ${author}\n\`Нарушитель:\` ${userForBan}\n\`Статус нарушителя:\` ${
              statusUserRoleId ? `<@&${statusUserRoleId}>` : `Пользователь`
            }\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: 0\n\`\`Против\`\`: 0`,
    */
    const moderatorSender = guild.members.cache.find(
      (member) =>
        `<@${member.id}>` === getValue(0) || `<@!${member.id}>` === getValue(0)
    ); // модератор отправитель
    const userForBanId = parseUserIdFromMention(getValue(1)); // пользователь который будет забанен

    const ban = await BansVotes.findOne({
      moderatorSenderId: moderatorSender.id,
      userForBanId,
    });

    if (!ban) {
      // проверяем факт существования действующей блокировки, если его нет, то удаляем сообщение бана
      return interaction.message.delete();
    }
    const { days, reason, agrees, denies } = ban; // данные из бана
    const moderationChannel = guild.channels.cache.get(channelsId.moderation); // канал куда отправится сообщение в случае чего

    if (agrees.length >= 5) {
      // если более 5 позитивных голосов за бан, то баним
      interaction.message.delete();
      await this.banUser(
        bot,
        interaction,
        userForBanId,
        days,
        reason,
        moderatorSender.id
      );
      return moderationChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ | Успешная блокировка пользователей!`)
            .setDescription(
              `**Пользователь ${userForBanId} был успешно заблокирован на \`${days}\` по причине \`${reason}\` по голосованию модераторов. Запросил: ${moderatorSender.id}**`
            )
            .setColor(Colors.DarkGreen)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (denies.length >= 5) {
      // если более 5 голосов отрицательных, то не баним
      interaction.message.delete();
      return moderationChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Упс..`)
            .setDescription(
              `**Пользователь ${userForBanId} был отказан от блокировки по голосованию модераторов. Запросил: ${moderatorSender.id}**`
            )
            .setColor(Colors.Red)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (
      user.permissions.has("Administrator") ||
      user.roles.cache.some((role) => role.id === rolesId.juniorDiscordMaster)
    ) {
      // если пользователь является администратором или является Jr. Discord Master, то одобряем или отказываем бан автоматически
      interaction.message.delete();

      if (interaction.customId === "banYes") {
        await this.banUser(
          bot,
          interaction,
          userForBanId,
          days,
          reason,
          moderatorSender.id
        );

        return moderationChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`✅ | Одобрение блокировки пользователя!`)
              .setDescription(
                `**Администратор ${user} одобрил блокировку пользователя <@${userForBanId}>\n\n\`Отправил\`: ${moderatorSender}\n\`Пользователь\`: <@${userForBanId}>\n\`Причина блокировки\`: ${reason}**`
              )
              .setColor(Colors.DarkGreen)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
        });
      }

      if (interaction.customId === "banNo") {
        await BansVotes.deleteOne({
          ...ban,
        }); // удаляем данные о голосовании из бд
        return moderationChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Отклонение блокировки пользователя!`)
              .setDescription(
                `**Администратор ${user} отклонил блокировку пользователя <@${userForBanId}>\n\n\`Отправил\`: ${moderatorSender}\n\`Пользователь\`: <@${userForBanId}>\n\`Причина блокировки\`: ${reason}**`
              )
              .setColor(Colors.Red)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
        });
      }
    }

    if (interaction.customId === "banYes") {
      await ban.updateOne({
        $set: {
          agrees: [...agrees, user.id],
          denies: denies.filter((userId) => userId !== user.id),
        },
      }); // обновляем в бд всё так, чтобы нельзя было проголосовать одновременно и за то и за то
      const { denies: actualDenies, agrees: actualAgrees } =
        await BansVotes.findOne({
          moderatorSenderId: moderatorSender.id,
          userForBanId: userForBanId,
        }); // получаем актуальные голоса и меняем эмбед
      return interaction.message.edit({
        content: `<@&${rolesId.juniorModerator}>`,
        embeds: [
          new EmbedBuilder()
            .setAuthor(interaction.message.embeds[0].author)
            .addFields({
              name: `Информация:`,
              value: `>>> \`Отправитель:\` ${moderatorSender}\n\`Нарушитель:\` ${userForBan}\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: ${actualAgrees.length}\n\`\`Против\`\`: ${actualDenies.length}`,
              inline: false,
            })
            .setColor(interaction.message.embeds[0].color)
            .setTimestamp()
            .setFooter(interaction.message.embeds[0].footer),
        ],
      });
    }

    if (interaction.customId === "banNo") {
      await ban.updateOne({
        $set: {
          denies: [...denies, user.id],
          agrees: agrees.filter((userId) => userId !== user.id),
        },
      }); // получаем актуальные голоса и меняем эмбед
      const { denies: actualDenies, agrees: actualAgrees } =
        await BansVotes.findOne({
          moderatorSenderId: moderatorSender.id,
          userForBanId,
        });

      return interaction.message.edit({
        content: `<@&${rolesId.juniorModerator}>`,
        embeds: [
          new EmbedBuilder()
            .setAuthor(interaction.message.embeds[0].author)
            .addFields({
              name: `Информация:`,
              value: `>>> \`Отправитель:\` ${moderatorSender}\n\`Нарушитель:\` ${userForBan}\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: ${actualAgrees.length}\n\`\`Против\`\`: ${actualDenies.length}`,
              inline: false,
            })
            .setColor(interaction.message.embeds[0].color)
            .setTimestamp()
            .setFooter(interaction.message.embeds[0].footer),
        ],
      });
    }
  },
};
