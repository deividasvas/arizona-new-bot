const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const kick = require("../../components/kick");
const sendUserMessage = require("../../components/sendUserMessage");
const setModerInfoParam = require("../../components/setModerInfoParam");
const settings = require("../../configs/settings");
const {
  rolesId,
  channelsId,
  whiteListRoles,
} = require("../../configs/settings");
const getMinutesInMs = require("../../components/getMinutesInMs");
const timeChecker = require("../../components/timeChecker");

const kicks = new timeChecker('кик');

module.exports = {
  name: "mkick", // название команды
  descr: "Исключить игрока из сервера", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь которого Вы хотите исключить из сервера",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "причина",
      description:
        "Причина по которой Вы хотите исключить пользователя из сервера",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => getAllRolesIdModers(), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const userForKick =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const reason = args[1];

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
    await sendUserMessage(
      {
        content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Вы были исключены из сервера!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Исключил: <@${author.id}>\n「📕」Причина: \`${reason}\`**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      },
      userForKick.id,
      guild
    ); // отправляем в лс пользователю сообщение об исключений
    await kick(bot, guild.id, userForKick.id, author, reason); // исключаем пользователя из сервера
    const moderationLog = guild.channels.cache.get(channelsId.moderationLog);
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система исключения пользователей.`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Исключил: <@${author.id}> (${author.user.tag})\n「📌」Кого: <@${userForKick.id}> (${userForKick.user.tag})\n「📕」Причина: \`${reason}\`**`
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
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система исключения пользователей.`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно исключили пользователя ${userForKick} по причине \`${reason}\`**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    // выдаем недельные муты и общие
    await setModerInfoParam(
      author.id,
      guild.id,
      "main",
      "kicks",
      ({ kicks }) => kicks + 1
    );
    await setModerInfoParam(
      author.id,
      guild.id,
      "week",
      "kicks",
      ({ kicks }) => kicks + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
      author.id,
      guild.id,
      "main",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.kick * coefficient
    );
    await setModerInfoParam(
      author.id,
      guild.id,
      "week",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.kick * coefficient
    );
    kicks.addModeratorPunish(author.id, guild.id);
  },
};
