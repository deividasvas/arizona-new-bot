const { EmbedBuilder } = require("discord.js");
const { rolesID } = require("../../configs/settings");

module.exports = {
  name: "verify", // название команды
  descr: "Получить роль 'Проверенный'", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: () => [rolesID.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, args }) => {
    if (author.roles.cache.some((role) => rolesID.verify === role.id)) {
      let roleHasAlready = new EmbedBuilder()
        .setColor(`Red`)
        .setTitle(`Ошибка!`)
        .setDescription(
          `\`${author.displayName}\`, У вас уже есть роль Проверенный 🔐`
        )
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL(),
        })
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [roleHasAlready],
      });
    }

    let embed = new EmbedBuilder()
      .setColor(`Green`)
      .setTitle(`Выдача роли`)
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL(),
      })
      .setDescription(
        `\`${author.displayName}\`, Вы успешно получили роль <@${rolesID.verify}>`
      )
      .setFooter({
        text: `Robo Hamster`,
        iconURL: `${bot.user.displayAvatarURL()}`,
      })
      .setTimestamp();
    interaction.reply({
      ephemeral: true,
      content: `${message.author}`,
      embeds: [embed],
    });
    author.roles.add(rolesID.verify, `Выдача роли проверенного через команду`);
  },
};
