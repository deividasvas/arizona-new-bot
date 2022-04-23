const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const getAllRolesIdInfoMakers = require("../../components/getAllRolesIdInfomakers");
const InfomakerEmbed = require("../../models/InfomakerEmbed");
module.exports = {
  name: "embclear", // название команды
  descr: "Команда для очистки своего эмбеда", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [],
  perms: () => getAllRolesIdInfoMakers(), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, guild, channel, author }) => {
    const embed = await InfomakerEmbed.findOne({
      guildId: guild.id,
      infoMakerId: author.id,
    });
    if (!embed) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не создавали эмбед**`)
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
    await InfomakerEmbed.deleteOne({
      guildId: guild.id,
      infoMakerId: author.id,
    });
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Очистка эмбеда`)
          .setDescription(`**Вы успешно очистили эмбед после себя. Спасибо!**`)
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
