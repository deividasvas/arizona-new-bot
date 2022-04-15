const { EmbedBuilder, Colors } = require("discord.js");
const { rolesId, channelsId } = require("../../configs/settings");

module.exports = {
  name: "event", // название команды
  descr: "Выдача роли Events's", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, message, author, interaction, guild }) => {
    if (author.roles.cache.some((role) => rolesId.events === role.id)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`🚫 | Ошибка!`)
            .setDescription(`**У вас уже есть роль <@&${rolesId.events}>!**`)
            .setColor(Colors.Red)
            .setTimestamp()
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
