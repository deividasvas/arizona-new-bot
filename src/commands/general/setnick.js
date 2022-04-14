const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const { rolesId } = require("../../configs/settings");

module.exports = {
  name: "setnick", // название команды
  descr: "Изменить никнейм пользователя", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "имя",
      description: "Новое имя на которое Вы хотите изменить",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args }) => {
    let nick = args[0];

    if (nick.length > 32 || nick.length < 1) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`🚫 | Ошибка!`)
            .setDescription(
              `**Никнейм не может быть меньше одного и больше 32 символов!**`
            )
            .setColor(Colors.Red)
            .setTimestamp()
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
    author.setNickname(nick, "Смена никнейма через команду").catch(() => {});

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Смена никнейма!`)
          .setDescription(`**Вы успешно сменили никнейм на \`${nick}\`!**`)
          .setColor(`DarkGreen`)
          .setTimestamp()
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
