const { EmbedBuilder, Colors } = require("discord.js");
const getAllRolesIdInfoMakers = require("../../components/getAllRolesIdInfomakers");
const InfomakerEmbed = require("../../models/InfomakerEmbed");
module.exports = {
  name: "embhelp", // название команды
  descr: "Помощь по командам инфомейкеров", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [],
  perms: () => getAllRolesIdInfoMakers(), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, guild, channel, author }) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Очистка эмбеда`)
          .setDescription(
            `\`Команды для модерации: /embsetup, /embfield, /embsend - отправить.\``
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
