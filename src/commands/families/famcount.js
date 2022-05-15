const { EmbedBuilder, Colors } = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "famcount", // название команды
  descr: "Количество участников семьи", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  async run({ bot, guild, author, interaction, rolesId, channelsId }) {
    const family = await Families.findOne({
      $or: [
        {
          ownerId: author.user.id,
        },
        {
          deputies: {
            $in: [
              {
                userId: author.user.id,
              },
            ],
          },
        },
      ],
    });

    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не являетесь владельцем или заместителем семьи**`
            )
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

    interaction.reply({
      ephemeral: true,
      embeds: [
        await new EmbedBuilder()
            .setDescription(
                `**「👨‍👨‍👧‍👦」Семья: ${guild.roles.cache.get(
                    family.roleId
                )}\n「🧍」Заместители семьи: ${
                    family.deputies.length > 0
                        ? family.deputies.map((deputy) => `<@${deputy.userId}>`)
                        : "-"
                }\`\`[${family.deputies.length}/${
                    settings.limitDeputyInFamilies
                }]\`\`\n「📌」Участников: \`${
                    guild.roles.cache.get(family.roleId).members.size
                }\`**`
            )
            .setColor(Colors.DarkGreen)
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
