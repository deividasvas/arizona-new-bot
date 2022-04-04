const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");

module.exports = {
  name: "faminfo", // название команды
  descr: "Получить информацию о семье", // описание команды
  private: false, // ограничена в использовании
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "семья",
      description: "Роль семьи о которой хотите узнать информацию",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ], // аргументы

  run: async ({ bot, guild, args, author, interaction }) => {
    const roleID = args[0];
    const family = (
      await bot.connection(
        `SELECT * FROM \`families\` WHERE \`role_id\` = '${roleID}'`
      )
    )[0];
    const role =
      guild.roles.cache.get(roleID) || (await guild.roles.fetch(roleID));

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Информация о семье!`)
          .setColor("RED")
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
          .setDescription(
            `**「👨‍👨‍👧‍👦」Семья: ${role}\n「📌」Участников: \`${
              role.members.size
            }\`\n「🧍」Владелец семьи: <@${family.owner_id}>${
              family.zam_id !== "0"
                ? `\n「🧍‍♂️」Заместитель семьи: <@${family.zam_id}>`
                : ""
            }**`
          ),
      ],
    });
  },
};
