const {
  EmbedBuilder,
  Colors,
  ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const { rolesId } = require("../../configs/settings");

module.exports = {
  name: "getmwarns", // название команды
  descr: "Узнать свою статистику наказаний по выговорам/предупреждениям", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description:
        "Модератор у которого Вы хотите статистику наказаний по выговорам/предупреждениям",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ], // аргументы
  perms: () => getAllRolesIdModers(), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const rolesAllowListForCheckOther = [
      rolesId.discordMaster,
      rolesId.juniorDiscordMaster,
      rolesId.adviceAdministration,
      rolesId.curatorModeration,
    ]; // роли которым можно просматривать чужие статистики наказаний
    if (
      args[0] &&
      !author.roles.cache.some((role) =>
        rolesAllowListForCheckOther.includes(role.id)
      )
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Просмотр чужих статистик наказаний возможно минимально от должности <@&${
                rolesAllowListForCheckOther[
                  rolesAllowListForCheckOther.length - 1
                ]
              }>**`
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

    const moderator = args[0]
      ? guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]))
      : author;

    const {
      warns: warnsOrRebukes,
      main: { immunities },
    } = await getModerInfo(bot, guild.id, moderator.id);

    const warns = warnsOrRebukes.filter(
      (warnOrRebuke) => warnOrRebuke.group === "warn"
    ); // все предупреждения
    const rebukes = warnsOrRebukes.filter(
      (warnOrRebuke) => warnOrRebuke.group === "rebuke"
    ); // все выговоры

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(
            args[0]
              ? `📌 | Статистика выговоров \`${moderator.displayName}\``
              : `📌 | Ваша статистика выговоров!`
          )
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**\nКоличество выговоров: \`${rebukes.length}\`${rebukes.map(
              (rebuke, index) =>
                `\n[${index + 1}] Причина выдачи: \`${rebuke.reason}\`\n[${
                  index + 1
                }] Выдал: <@${rebuke.initiatorId}>`
            )}\nКоличество предупреждений: \`${
              warns.length
            }\`\nКоличество иммунитетов: \`${immunities}\`\n**`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
