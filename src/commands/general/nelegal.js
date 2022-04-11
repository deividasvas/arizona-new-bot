const { EmbedBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { ButtonBuilder } = require("discord.js/node_modules/@discordjs/builders");
const { rolesId, channelsId } = require("../../configs/settings");

module.exports = {
  name: "nelegal", // название команды
  descr: "Нелегальный сервер", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду


  run: async ({ bot, interaction, author, guild }) => {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
            .setAuthor({
                name: `${author.user.tag}`,
                iconURL: author.displayAvatarURL()
            })
          .setColor(`DarkGreen`)
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
