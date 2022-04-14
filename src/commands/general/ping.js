const { EmbedBuilder, Colors } = require("discord.js");
const { rolesId } = require("../../configs/settings");

module.exports = {
  name: "ping", // название команды
  descr: "Информация о работоспобности бота.", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  async run({ bot, interaction, guild }) {
    const createdTimestamp = new Date();
    interaction
      .reply({
        ephemeral: true,
        content: `Собираю информацию, ожидайте...`,
      })
      .then(() => {
        interaction.editReply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`📌 | Информация`)
              .setDescription(
                `**Discord API: \`${
                  new Date() - createdTimestamp
                } ms\`\nBot ping: \`${bot.ws.ping} ms\`**`
              )
              .setColor(Colors.DarkGreen)
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
      });
  },
};
