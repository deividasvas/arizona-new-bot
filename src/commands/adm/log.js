const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
} = require("discord.js");
const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");
const { channelsId } = require("../../configs/settings");
const { ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "log", // название команды
  descr:
    "Сообщить тех.администраторам об пользователе который может являтся махинатором", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: "никнейм",
      description: "Никнейм пользователя который будет проверятся",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "источник",
      description: "От куда узнали данную информацию",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "причина",
      description:
        "Что показалось Вам подозрительным, и из-за чего Вы хотите чтобы проверили данного игрока",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => {
    return getAllRolesIdAdmins();
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, author, guild }) => {
    const nickname = args[0]; // ник на того кого кидают мониторингч
    const from = args[1]; // источник с которого узнали информацию
    const reason = args[2]; // причина по которой на него кидают мониторинг
    const logMonitoringChannel = guild.channels.cache.find(
      (channel) => channel.id === channelsId.logMonitoring
    );
    logMonitoringChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Grey)
          .setTitle(`📌 | Лог Мониторинг`)
          .addFields(
            {
              name: `🐹・Информация о запросе`,
              value: `>>> **「🧍」Запросил: <@${author.id}>\n「👱」Ник-Нейм: \`${nickname}\`\n「🏔」Источник: \`${from}\`\n「📄」Причина: \`${reason}\`**`,
              inline: true,
            },
            {
              name: `📌・Результат проверки`,
              value: `>>> **「🎸」Статус: \`В обработке\`\n「🔥」Проверил: \`Нет\`**`,
              inline: true,
            }
          )
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("logMonitoringYes")
            .setLabel("Проверенно, что-то нашёл")
            .setStyle(ButtonStyle.Success)
            .setEmoji({
              id: "886020016925990912",
            })
        ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("logMonitoringNo")
            .setLabel("Проверенно, ничего не нашёл")
            .setStyle(ButtonStyle.Danger)
            .setEmoji({
              id: "886020016120672286",
            })
        ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel(`Лог 📌 ${nickname}`)
            .setStyle(ButtonStyle.Link)
            .setURL(
              `http://ulog.union-u.net/search.php?searchtext=${nickname
                .split(" ")
                .join("_")}&server=10`
            )
        ),
      ],
      content: `http://ulog.union-u.net/search.php?searchtext=${nickname
        .split(" ")
        .join("_")}&server=15`,
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Grey)
          .setTitle(`📌 | Лог Мониторинг`)
          .setDescription(`**Вы успешно оставили заявку на проверку логов игрока \`${nickname}\` по причине \`${reason}\`. Источник данных: \`${from}\`**`)
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
  },
};
