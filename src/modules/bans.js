const { EmbedBuilder, Colors } = require("discord.js");
const ban = require("../components/ban");
const getAllRolesIdModers = require("../components/getAllrolesIdModers");
const sendUserMessage = require("../components/sendUserMessage");
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
            `**「📝」Запросил бан: <@${moderatorId}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`**`
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
  },
  async run({ bot, interaction, user, guild }) {
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
    const userForBan = guild.members.cache.find(
      (member) => `<@${member.id}>` === getValue(1)
    ); // пользователь который будет забанен

    const ban = await BansVotes.findOne({
      moderatorSenderId: moderatorSender.id,
      userForBanId: userForBan.id,
    });

    if (!ban) {
      return interaction.message.delete();
    }
    const { days, reason, agrees, denies } = ban;
    const moderationChannel = guild.channels.cache.get(channelsId.moderation);

    if (!userForBan) {
      interaction.message.delete();

      return moderationChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Пользователь ${getValue(
                1
              )} которого нужно было заблокировать на \`${days}\` дней по причине \`${reason}\` по форме модератора ${moderatorSender} - вышел с сервера. Пользователь добавлен в список будущих блокировок.**`
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

    if (agrees.length >= 5) {
      interaction.message.delete();
      await this.banUser(
        bot,
        interaction,
        userForBan.id,
        days,
        reason,
        moderatorSender.id
      );
      await ban.remove();
      return moderationChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ | Успешная блокировка пользователей!`)
            .setDescription(
              `**Пользователь ${userForBan.id} был успешно заблокирован на \`${days}\` по причине \`${reason}\` по голосованию модераторов. Запросил: ${moderatorSender.id}**`
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

    if (agrees.length >= 5) {
      interaction.message.delete();
      await this.banUser(
        bot,
        interaction,
        userForBan.id,
        days,
        reason,
        moderatorSender.id
      );
      await ban.remove();
      return moderationChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Упс..`)
            .setDescription(
              `**Пользователь ${userForBan.id} был отказан от блокировки по голосованию модераторов. Запросил: ${moderatorSender.id}**`
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
          userForBan.id,
          days,
          reason,
          moderatorSender.id
        );

        await ban.remove();
        return moderationChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`✅ | Одобрение блокировки пользователя!`)
              .setDescription(
                `**Администратор ${user} одобрил блокировку пользователя ${userForBan}\n\n\`Отправил\`: ${moderatorSender}\n\`Пользователь\`: ${userForBan}\n\`Причина блокировки\`: ${reason}**`
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
        await ban.remove();
        return moderationChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Отклонение блокировки пользователя!`)
              .setDescription(
                `**Администратор ${user} отклонил блокировку пользователя ${userForBan}\n\n\`Отправил\`: ${moderatorSender}\n\`Пользователь\`: ${userForBan}\n\`Причина блокировки\`: ${reason}**`
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
      });
      const { denies: actualDenies, agrees: actualAgrees } =
        await BansVotes.findOne({
          moderatorSenderId: moderatorSender.id,
          userForBanId: userForBan.id,
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

    if (interaction.customId === "banNo") {
      await ban.updateOne({
        $set: {
          denies: [...denies, user.id],
          agrees: agrees.filter((userId) => userId !== user.id),
        },
      });
      const { denies: actualDenies, agrees: actualAgrees } =
        await BansVotes.findOne({
          moderatorSenderId: moderatorSender.id,
          userForBanId: userForBan.id,
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
