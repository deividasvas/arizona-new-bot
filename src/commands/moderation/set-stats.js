const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const setModerInfoParam = require("../../components/setModerInfoParam");
const getModerInfo = require("../../components/getModerInfo");
const { rolesId, channelsId } = require("../../configs/settings");

const choices = [
  // подсказки к аргументу
  // все возможные типы статистики.
  {
    name: "Количество отвеченных тикетов",
    value: "tickets",
  },
  {
    name: "Количество снятых ролей",
    value: "roles",
  },
  {
    name: "Количество выданных блокировок",
    value: "bans",
  },
  {
    name: "Количество выданных мутов",
    value: "mutes",
  },
  {
    name: "Количество выданных мутов",
    value: "mutes",
  },
  {
    name: "Количество хороших оценок",
    value: "goodAnswers",
  },
  {
    name: "Количество плохих оценок",
    value: "toxicAnswers",
  },
  {
    name: "Количество баллов",
    value: "balls",
  },
  {
    name: "Коэффициент",
    value: "coefficient",
  },
];

module.exports = {
  name: "set-stats", // название команды
  descr: "Изменить статистику модератора", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Модератор которому Вы хотите обновить статистику",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "тип",
      description: "Тип статистики который Вы хотите обновить пользователю",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices,
    },
    {
      name: "количество",
      description:
        "Количество в цифрах на которое Вы хотите изменить тип статистики модератора",
      type: ApplicationCommandOptionType.Number,
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
    const whiteListChannels = [
      channelsId.curators,
      channelsId.administrationCouncil,
      channelsId.discordMasters,
    ]; // белый список каналов куда отправляется для всех пользователей
    const member =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0])); // модератор которому будем меняь статистику
    const typeStatistic = args[1]; // тип статистики
    const newCount = args[2]; // новое количество для типа статистики
    const { main, error } = await getModerInfo(guild, member.id);
    if (error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: !whiteListChannels.includes(channel.id), // смотрим находится ли канал в белом списке, если да, то true, если нет, то false
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${member} не является модератором. Если это не так, то обратитесь к <@&${rolesId.techSection}>**`
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

    await setModerInfoParam(member.id, "main", typeStatistic, newCount);
    const choice = choices.find((choice) => choice.value === typeStatistic);

    interaction.reply({
      ephemeral: !whiteListChannels.includes(channel.id), // смотрим находится ли канал в белом списке, если да, то true, если нет, то false
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `📌 | Изменение статистики модератора`,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно изменили \`${choice.name.toLowerCase()}\` модератору <@${
              member.id
            }>\nБыло: \`${main[typeStatistic]}\`\nСтало: \`${newCount}\`**`
          )
          .setColor(`Red`)
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
