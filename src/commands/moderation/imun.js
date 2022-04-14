const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const setModerInfoParam = require("../../components/setModerInfoParam");
const { rolesId, channelsId } = require("../../configs/settings");

module.exports = {
  name: "imun", // название команды
  descr: "Выдать модератору иммунитет", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Модератор которому Вы хотите выдать иммунитет",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "причина",
      description: "Причина по которой Вы выдаёте модератору иммунитет",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => [
    rolesId.discordMaster, // discord master
    rolesId.juniorDiscordMaster, // jr.discord master
    rolesId.adviceAdministration, // совет администрации дискорда
    rolesId.curatorModeration, // куратор модерации
  ], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const moderator =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const reason = args[1];
    const { error, main } = await getModerInfo(guild, moderator.id);
    if (error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${member} не является модератором. Если это не так, то обратитесь к <@&${rolesId.techSection}**`
            )
            .setColor(`Red`)
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
    const { immunities } = main;
    if (immunities >= 2) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Максимальное количество иммунитетов которое может быть у модератора - \`${immunities}\`**`
            )
            .setColor(`Red`)
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

    await setModerInfoParam(moderator.id, "main", "immunities", ({ immunities }) => immunities + 1);
    const punishModeratorsLogChannel = guild.channels.cache.get(
      channelsId.punishModeratorsLog
    );
    punishModeratorsLogChannel.send({
      content: `${author} ${moderator}`,
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(`📌 | Система выдачи иммунитетов!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Выдал: <@${author.id}>\n「😁」Кому: ${moderator}\n「📕」Причина: \`${reason}\`\n「🙀」Теперь у него ${immunities + 1} иммунитет(ов)**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(`📌 | Система выдачи иммунитетов!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно выдали иммунитет модератору ${moderator} по причине \`${reason}\`. Теперь у него \`${immunities + 1}\` иммунитет(ов)**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
