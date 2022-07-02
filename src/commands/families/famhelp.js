const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
} = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const Families = require("../../models/Families");

module.exports = {
  name: "famhelp", // название команды
  descr: "Помощь по семейным командам", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [], // аргументы

  async run({bot, guild, args, author, interaction}) {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
            .setTitle(`📌 | Помощь по семейным командам`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            })
            .addFields([
              {
                name: `**Создание, удаление, информация, покинуть**`,
                value: `**Информация о семье:** \`/faminfo [название]\`\n**Покинуть семью: \`/fleave\`**`,
              },
              {
                name: `**Управление семьей**`,
                value: `**Назначить заместителя:** \`/famaddzam [user]\`\n**Снять заместителя:** \`/famdelzam [user]\`\n**Посмотреть информацию о своей семье:** \`/famcount\``,
              },
              {
                name: `**Команды для заместителей**`,
                value: `**Пригласить участника:** \`/faminvite [user]\`\n**Исключить участника:** \`/famkick [user]\``,
              }
            ]),
      ],
    });
  },
};
