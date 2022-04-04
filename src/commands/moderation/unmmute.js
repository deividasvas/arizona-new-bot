const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllRolesIDModers = require("../../components/getAllRolesIDModers");
const sendUserMessage = require("../../components/sendUserMessage");
const { rolesID, channelsID } = require("../../configs/settings");

module.exports = {
  name: "unmmute", // название команды
  descr: "Выдача блокировки возможности писать/говорить", // описание команды
  private: false, // ограничена в использовании
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь с которого будет снят мут",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "причина",
      description: "Причина по которой пользователю нужно снят мут",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => {
    return getAllRolesIDModers(); // все модерские роли
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args }) => {
    const userForUnmute =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const reason = args[1];

    if (!userForUnmute.roles.cache.some((role) => role.id === rolesID.muted)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${userForUnmute} не замучен**`)
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

    await userForUnmute.roles.remove(rolesID.muted);

    userForUnmute.timeout(
      1,
      `Снятие мута by ${author.user.tag} | Причина: "${reason}"`
    );

    const moderationLog =
      guild.channels.cache.get(channelsID.moderationLog) ||
      (await guild.channels.fetch(channelsID.moderationLog));
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(`📌 | Система снятия мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Снял: <@${author.id}> (${author.user.tag})\n「📌」Кому: <@${userForUnmute.id}> (${userForUnmute.user.tag})\n「📕」Причина: \`${reason}\`\n**`
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
        embeds: [
          new EmbedBuilder()
            .setColor("DarkGreen")
            .setTitle(`📌 | Система снятия мута!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Снял: <@${author.id}> (${author.user.tag})\n「📕」Причина: \`${reason}\`\n**`
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
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("DarkGreen")
          .setTitle(`📌 | Система снятия мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно сняли мут пользователю ${userForUnmute} по причине \`${reason}\`**`
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
