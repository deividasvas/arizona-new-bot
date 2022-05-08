const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  name: "event", // название команды
  descr: "Выдача/снятие роли Events's", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, author, interaction, guild, rolesId, channelsId }) => {
    if (author.roles.cache.some((role) => rolesId.events === role.id)) {
      author.roles.remove(rolesId.events);
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
              .setTitle(`📌 | Снятие роли`)
              .setDescription(
                  `**Вы успешно сняли роль <@&${rolesId.events}>!**`
              )
              .setColor(Colors.DarkGreen)
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
    author.roles.add(rolesId.events, `Выдача роли Event's через команду`);

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Получение роли`)
          .setDescription(
            `**Вы успешно получили роль <@&${rolesId.events}>! Теперь Вам доступен канал: <#${channelsId.events}>**`
          )
          .setColor(Colors.DarkGreen)
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
