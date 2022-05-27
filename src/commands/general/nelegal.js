const { EmbedBuilder, ActionRowBuilder, ButtonStyle, Colors } = require("discord.js");
const { ButtonBuilder } = require("discord.js");

module.exports = {
  name: "nelegal", // название команды
  descr: "Нелегальный сервер", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду


  run: async ({ bot, interaction, author, guild }) => {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
            .setAuthor({
                name: `${author.user.tag}`,
                iconURL: author.displayAvatarURL()
            })
          .setColor(Colors.Blue)
          .setDescription("**Чтобы перейти в Discord канал нелегалок , нажмите кнопку ниже!**")
          .setTimestamp()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL()
        })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Магический портал!")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.gg/Je97Bh4`)
        ),
      ],
    });
  },
};
