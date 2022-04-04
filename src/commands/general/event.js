const { EmbedBuilder } = require("discord.js");
const { rolesID, channelsID } = require("../../configs/settings");

module.exports = {
  name: "event", // название команды
  descr: "Выдача роли Events's", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: () => [rolesID.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, message, author, interaction, guild }) => {
    if (author.roles.cache.some((role) => rolesID.events === role.id)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`🚫 | Ошибка!`)
            .setDescription(`**У вас уже есть роль <@&${rolesID.events}>!**`)
            .setColor(`Red`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    author.roles.add(rolesID.events, `Выдача роли Event's через команду`);

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Получение роли`)
          .setDescription(
            `**Вы успешно получили роль <@&${rolesID.events}>! Теперь Вам доступен канал: <#${channelsID.events}>**`
          )
          .setColor(`DarkGreen`)
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
