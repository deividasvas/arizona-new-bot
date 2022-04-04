const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const getAllRolesIDAdmins = require("../../components/getAllRolesIDAdmins");
const { channelsID } = require("../../configs/settings");
const { ApplicationCommandOptionType } = require('discord.js');
module.exports = {
  name: "log", // название команды
  descr:
    "Сообщить тех.администраторам об пользователе который может являтся махинатором", // описание команды
  private: false, // ограничена в использовании
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
    return getAllRolesIDAdmins();
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, author, guild }) => {
    const nickname = args[0]; // ник на того кого кидают мониторингч
    const from = args[1]; // источник с которого узнали информацию
    const reason = args[2]; // причина по которой на него кидают мониторинг
    const logMonitoringChannel = guild.channels.cache.find(
      (channel) => channel.id === channelsID.logMonitoring
    );
    logMonitoringChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Grey")
          .setTitle(`📌 | В рассмотрении`)
          .setDescription(
            `**「🧍」Запросил: <@${author.id}>\n「👱‍♂️」Ник-Нейм: \`${nickname.split(" ").join("_")}\`\n「🏔」Источник: \`${from}\`\n「📄」Причина: \`${reason}\`**`
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
            .setCustomId("log_monitoring_yes")
            .setLabel("Проверенно, что-то нашёл")
            .setStyle(ButtonStyle.Success)
            .setEmoji({
                id: "886020016925990912"
            })
        ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("log_monitoring_no")
            .setLabel("Проверенно, ничего не нашёл")
            .setStyle(ButtonStyle.Danger)
            .setEmoji({
                id: "886020016120672286"
            })
        ),
      ],
      content: `http://ulog.union-u.net/search.php?searchtext=${nickname.split(" ").join("_")}&server=15`,
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("DARK_GREEN")
          .setTitle(`📌 | Лог Мониторинг`)
          .setDescription(
            `**Вы успешно отправили запрос об проверке игрока \`\`${nickname}\`\` на логи в канал <#${channelsID.logMonitoring}>**`
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
    });
  },
};
