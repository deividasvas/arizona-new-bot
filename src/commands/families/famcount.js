const { EmbedBuilder } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const { rolesID } = require("../../configs/settings");
const settings = require("../../configs/settings");

module.exports = {
  name: "famcount", // название команды
  descr: "Количество участников семьи", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, guild, author, interaction }) => {
    const owner = await bot.connection(
      `SELECT * FROM \`families\` WHERE \`owner_id\` = '${author.user.id}'`
    );

    if (owner.length === 0) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не являетесь владельцем семьи**`)
            .setColor(`RED`)
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

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**「👨‍👨‍👧‍👦」Семья: ${guild.roles.cache.get(
              owner[0].role_id
            )}\n「📌」Участников: \`${
              guild.roles.cache.get(owner[0].role_id).members.size
            }\`**`
          )
          .setColor(`DARK_GREEN`)
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
  },
};
