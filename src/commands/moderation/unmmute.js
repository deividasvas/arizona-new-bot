const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllrolesIdModers = require("../../components/getAllRolesIdModers");
const sendUserMessage = require("../../components/sendUserMessage");
const unmute = require("../../components/unmute");

module.exports = {
  name: "unmmute", // название команды
  descr: "Отключение ограничений писать/говорить", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
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
  perms: (rolesId) => {
    return getAllrolesIdModers(rolesId); // все модерские роли
  }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, rolesId, channelsId }) => {
    const userForUnmute =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const reason = args[1];

    if (!userForUnmute.roles.cache.some((role) => role.id === rolesId.muted)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${userForUnmute} не замучен**`)
            .setColor(Colors.Blue)
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
    unmute(bot, userForUnmute.id, author.id, reason);

    const moderationLog = guild.channels.cache.get(channelsId.moderationLog); // канал куда отправляем сообщение о снятии мута
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`📌 | Система снятия мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Снял: ${author} (${author.id})\n「📌」Кому: <@${userForUnmute.id}> (${userForUnmute.user.tag})\n 「📕」Причина: \`${reason}\`\n**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    }); // отправляем в этот канал сообщение о снятии мута

    await sendUserMessage(
        {
          embeds: [
            new EmbedBuilder()
                .setColor(Colors.Blue)
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
          .setColor(Colors.Blue)
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
