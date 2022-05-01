const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
} = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const settings = require("../../configs/settings");
const { rolesId } = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "famhelp", // название команды
  descr: "Помощь по семейным командам", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: () => {
    return getAllRolesIdFamilies(); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [], // аргументы

  async run({ bot, guild, args, author, interaction }) {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Помощь по семейным командам`)
          .setColor(Colors.Red)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
          .addFields(
            {
              name: `**Создание, удаление, информация, покинуть**`,
              value: `**Создать семью:** \`/createfam\`\n**Удалить семью:** \`/deletefam [название]\`\n**Информация о семье:** \`/faminfo [название]\`\n**Покинуть семью: \`/fleave [название семьи]\`**`,
            },
            {
              name: `**Управление семьей**`,
              value: `**Назначить заместителя:** \`/famaddzam [user]\`\n**Снять заместителя:** \`/famdelzam [user]\`\n**Посмотреть информацию о своей семье:** \`/famcount\``,
            },
            {
              name: `**Команды для заместителей**`,
              value: `**Пригласить участника:** \`/faminvite [user]\`\n**Исключить участника:** \`/famkick [user]\``,
            }
          ),
      ],
    });
  },
};
