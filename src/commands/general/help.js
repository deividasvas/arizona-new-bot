const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "help", // название команды
  descr: "Помощь по командам", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, args }) => {
    // Сделать фильтрацию команд
    // Ограничить попадание структур owner и moders в general
    const commands = [...bot.commands.values()].slice(0, 5); // делаем ограничение до 5 команд чтобы не было слишком много.

    const isAdmin = message.member.permissions.has("ADMINISTRATOR");

    const isAllowCommand = (cmd) => {
      const rolesId = {...message.guild.roles.cache};
      const allowRolesId = cmd.perms(rolesId); // тут список ролей которым разрешён доступ к команде.
      const roles = [...message.member.roles.cache]; // тут роли чела
      if(!allowRolesId.find(allowRoleId => roles.includes(allowRoleId))){
        return false;
      }
      return true;
     }
     
     const allowCommands = commands.filter(cmd => isAllowCommand(cmd));

    interaction
      .reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`📌 | Список команд!`)
            .setDescription(
              `**/${allowCommands.name} - ${allowCommands.descr}**`
            )
            .setColor(Colors.Blue)
            .setTimestamp()
            
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
        content: `${author}`,
      });
  },
};
