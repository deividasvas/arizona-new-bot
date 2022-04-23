const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllrolesIdModers = require("../../components/getAllrolesIdModers");
const mute = require("../../components/mute");
const sendUserMessage = require("../../components/sendUserMessage");
const setModerInfoParam = require("../../components/setModerInfoParam");
const settings = require("../../configs/settings");
const { rolesId, channelsId, whiteListRoles } = require("../../configs/settings");
const Punish = require("../../models/Punishment");

module.exports = {
  name: "mmute", // название команды
  descr: "Выдача ограничений писать/говорить", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь который будет замучен",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "время",
      description: "Время на которое будет наказан пользователь | В минутах",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: "причина",
      description: "Причина по которой пользователь должен быть замучен",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => {
    return getAllrolesIdModers(); // все модерские роли
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args }) => {
    const userForMute =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const time = args[1];
    const reason = args[2];

    const roleInWhiteList = userForKick.roles.cache.find((role) =>
    whiteListRoles.includes(role.id)
    ); // проверяем, есть ли у человека роль которая находится в белом списке по отношению к выдачам наказаний.
    if (roleInWhiteList) {
      // если у человека есть роль из белого списка ролей, то отвечаем запросившему что у пользователя роль из белого списка
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Пользователя ${userForKick} невозможно наказать потому, что, у него есть роль <@&${roleInWhiteList.id}> которая находится в белом списке.**`
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

    if (userForMute.roles.cache.some((role) => role.id === rolesId.muted)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${userForMute} уже находится в муте**`)
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

    const moderationLog =
      guild.channels.cache.get(channelsId.moderationLog) ||
      (await guild.channels.fetch(channelsId.moderationLog));
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система выдачи мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Выдал: <@${author.id}> (${author.user.tag})\n「📌」Кому: <@${userForMute.id}> (${userForMute.user.tag})\n「📕」Причина: \`${reason}\`\n「📅」До снятия мута \`${time}\` минут**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });

    sendUserMessage(
      {
        content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Система выдачи мута!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Выдал: <@${author.id}> (${author.user.tag})\n「📕」Причина: \`${reason}\`\n「📅」До снятия мута \`${time}\` минут**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      },
      userForMute.id,
      guild
    );
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система выдачи мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно выдали мут пользователю ${userForMute} на \`${time}\` по причине \`${reason}\`**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    mute(bot, guild.id, userForMute.id, author, time, reason);
    // выдаем недельные муты и общие
    await setModerInfoParam(
      author.id,
      guild.id,
      "main",
      "mutes",
      ({ mutes }) => mutes + 1
    );
    await setModerInfoParam(
      author.id,
      guild.id,
      "week",
      "mutes",
      ({ mutes }) => mutes + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
      author.id,
      guild.id,
      "main",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.mute * coefficient
    );
    await setModerInfoParam(
      author.id,
      guild.id,
      "week",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.mute * coefficient
    );
  },
};
