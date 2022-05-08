const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "faminfo", // название команды
  descr: "Получить информацию о семье", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: () => {
    return getAllRolesIdFamilies(); // все айди семейных ролей
  }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "семья",
      description: "Роль семьи о которой хотите узнать информацию",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ], // аргументы

  async run({ bot, guild, args, author, interaction }) {
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
            .setColor(Colors.Red)
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
          .setColor(Colors.Red)
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
