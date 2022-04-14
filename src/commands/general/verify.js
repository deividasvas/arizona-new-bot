const { EmbedBuilder, Colors } = require("discord.js");
const { rolesId } = require("../../configs/settings");

module.exports = {
  name: "verify", // название команды
  descr: "Получить роль 'Проверенный'", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, args, guild }) => {
    if (author.roles.cache.some((role) => rolesId.verify === role.id)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(`❌ | Ошибка!`)
            .setTitle(`Ошибка!`)
            .setDescription(`**У вас уже есть роль Проверенный 🔐**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setTimestamp(),
        ],
      });
    }

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(`Green`)
          .setTitle(`Выдача роли`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `\`${author.displayName}\`, Вы успешно получили роль <@&${rolesId.verify}>`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: `${bot.user.displayAvatarURL()}`,
          })
          .setTimestamp(),
      ],
    });
    author.roles.add(rolesId.verify, `Выдача роли проверенного через команду`);
  },
};
