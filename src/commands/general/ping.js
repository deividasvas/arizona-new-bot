const { EmbedBuilder } = require("discord.js");
const { rolesId } = require("../../configs/settings");

module.exports = {
  name: "ping", // название команды
  descr: "Информация о работоспобности бота.", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду


  run: async ({ bot, interaction, guild }) => {
    const createdTimestamp = new Date();
    interaction
      .reply({
        ephemeral: true,
        content: `Собираю информацию, ожидайте...`,
      })
      .then(() => {
        interaction
          .editReply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setTitle(`📌 | Информация`)
                .setDescription(
                  `**Discord API: \`${
                    new Date() - createdTimestamp
                  } ms\`\nBot ping: \`${bot.ws.ping} ms\`**`
                )
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
          })
      });
  },
};
