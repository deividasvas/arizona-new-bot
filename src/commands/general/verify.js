const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  name: "verify", // название команды
  descr: "Получить/снять роль 'Проверенный'", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, args, guild, rolesId }) => {
    if (author.roles.cache.some((role) => rolesId.verify === role.id)) {
      author.roles.remove(rolesId.verify);
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
              .setColor(Colors.Green)
              .setTitle(`📌 | Снятие роли`)
            .setDescription(`**Вы успешно сняли роль <@&${rolesId.verify}>!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setTimestamp(),
        ],
      });
    }

    interaction.reply({
      ephemeral: true, embeds: [new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle(`📌 | Выдача роли`)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL(),
          })
          .setDescription(`\`${author.displayName}\`, Вы успешно получили роль <@&${rolesId.verify}>`)
          .setFooter({
            text: `Surprise Bot`, iconURL: `${bot.user.displayAvatarURL()}`,
          })
          .setTimestamp(),
      ],
    });
    author.roles.add(rolesId.verify, `Выдача роли проверенного через команду`);
  },
};
