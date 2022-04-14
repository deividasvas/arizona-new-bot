const { EmbedBuilder, Colors } = require("discord.js");
const { rolesId } = require("../../configs/settings");

module.exports = {
  name: "help", // название команды
  descr: "Команда для помощи по командам", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, args }) => {
    // Сделать фильтрацию команд
    // Ограничить попадание структур owner и moders в general
    const commands = [...bot.commands.values()].slice(0, 5); // делаем ограничение до 5 команд чтобы не было слишком много.

    interaction
      .reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`📌 | Список команд!`)
            .setDescription(
              `**${commands
                .map((command) => `/${command.name} - \`${command.descr}\``)
                .join("\n")}**`
            )
            .setColor(Colors.DarkGreen)
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
