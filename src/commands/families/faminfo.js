const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");
const Families = require("../../models/Families");

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
    const roleId = args[0];
    const family = await Families.findOne({
      roleId,
    });
    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Данной семьи не существует**`)
            .setColor(`Red`)
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
    const role =
      guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId));

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Информация о семье!`)
          .setColor("Red")
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
            }\`\n「🧍」Владелец семьи: <@${
              family.ownerId
            }>\n「🧍」Заместители семьи: ${
              family.deputies.length > 0
                ? family.deputies.map((deputy) => `<@${deputy.userId}>`)
                : "-"
            }\`\`[${family.deputies.length}/${settings.limitDeputyInFamilies}]\`\`**`
          ),
      ],
    });
  },
};
