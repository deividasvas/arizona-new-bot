const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllRolesIDModers = require("../../components/getAllRolesIDModers");
const sendUserMessage = require("../../components/sendUserMessage");
const { rolesID, channelsID } = require("../../configs/settings");

module.exports = {
  name: "mmute", // название команды
  descr: "Выдача блокировки возможности писать/говорить", // описание команды
  private: false, // ограничена в использовании
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
    return getAllRolesIDModers(); // все модерские роли
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args }) => {
    const userForMute =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const time = args[1];
    const reason = args[2];

    if (userForMute.roles.cache.some((role) => role.id === rolesID.muted)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${userForMute} уже находится в муте**`)
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

    userForMute.timeout(
      convertMinutesToMs(time),
      `Выдача мута by ${author.user.tag} | Причина: "${reason}"`
    );
    await userForMute.roles.add(rolesID.muted);

    const moderationLog =
      guild.channels.cache.get(channelsID.moderationLog) ||
      (await guild.channels.fetch(channelsID.moderationLog));
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
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

    sendUserMessage({
        content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
        embeds: [
            new EmbedBuilder()
              .setColor("DarkGreen")
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
    }, userForMute.id, guild);
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
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
  },
};
