const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const ban = require("../../components/ban");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const kick = require("../../components/kick");
const sendUserMessage = require("../../components/sendUserMessage");
const setModerInfoParam = require("../../components/setModerInfoParam");
const settings = require("../../configs/settings");
const {
  rolesId,
  channelsId,
  whiteListRoles,
} = require("../../configs/settings");

module.exports = {
  name: "mban", // название команды
  descr: "Заблокировать пользователя на сервере", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь которого Вы заблокировать на сервере",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "срок",
      description: "Срок в днях насколько Вы хотите заблокировать пользователя",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: "причина",
      description: "Причина по которой Вы хотите заблокировать пользователя",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => getAllRolesIdModers(), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const userForBan =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const days = args[1];
    const reason = args[2];

    const roleInWhiteList = userForBan.roles.cache.find((role) =>
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
              `**Пользователя ${userForBan} невозможно наказать потому, что, у него есть роль <@&${roleInWhiteList.id}> которая находится в белом списке.**`
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

    let statusUserRoleId = ""; // id роли которая показывает статус пользователя в игре, заместитель фракции, лидер, министр.

    const roleStatus = guild.roles.cache.find((role) =>
      [
        rolesId.leadersFractions, // лидеры
        rolesId.ministers, // министры
        rolesId.deputiesFractions, // заместители
      ].includes(role.id)
    );

    if (roleStatus) {
      statusUserRoleId = roleStatus.id;
    }

    const moderationChannel = guild.channels.cache.get(channelsId.moderation);

    moderationChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x483d8b)
          .setTimestamp()
          .setTitle(`📌 | Временая блокировка участника.`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
          .setDescription(
            {
              name: `Информация`,
              value: `**「👨🏼‍💼」Отправитель: <@${
                author.id
              }>\n「👹」Нарушитель: <@${
                userForBan.id
              }>\n「🌌」Статус нарушителя: ${
                statusUserRoleId ? `<@${statusUserRoleId}>` : `Пользователь`
              }\n「🕒」Дней блокировки: ${days}**`,
            },
            {
              name: `「🔥」Причина выдачи`,
              value: `${reason}`,
            }
          ),
      ],
    });

    return;
    await sendUserMessage(
      {
        content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
        embeds: [
          new EmbedBuilder()
            .setColor("DarkGreen")
            .setTitle(`📌 | Вы были заблокированы на сервера!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Заблокировал: <@${author.id}>\n「📕」Причина: \`${reason}\`\n「📅」Блокировка кончится через \`${days}\` дней**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      },
      userForBan.id,
      guild
    ); // отправляем в лс пользователю сообщение об блокировке
    await ban(bot, guild.id, userForKick.id, author, days, reason); // блокируем пользователя
    const moderationLog = guild.channels.cache.get(channelsId.moderationLog);
    moderationLog.send({
      embeds: [
        new EmbedBuilder()
          .setColor(`DarkGreen`)
          .setTitle(`📌 | Система блокировки пользователей.`)
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
          .setColor("DarkGreen")
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
      "main",
      "kicks",
      ({ kicks }) => kicks + 1
    );
    await setModerInfoParam(
      author.id,
      "week",
      "kicks",
      ({ kicks }) => kicks + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
      author.id,
      "main",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.kick * coefficient
    );
    await setModerInfoParam(
      author.id,
      "week",
      "balls",
      ({ balls, coefficient }) => balls + settings.rates.kick * coefficient
    );
  },
};
