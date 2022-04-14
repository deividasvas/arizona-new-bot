const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const settings = require("../../configs/settings");
const { rolesId } = require("../../configs/settings");
const CommandsDisabled = require("../../models/CommandsDisabled");
module.exports = {
  name: "cmd", // название команды
  descr: "Команда для управления командами", // описание команды
  perms: () => [rolesId.discordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: "действие",
      description:
        "Введите действие которое Вы хотите произвести(restart, stop, start)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "команда",
      description: "Введите название команды с которой Вы производите действия",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы

  run: async ({ bot, interaction, channel, args, developers, author }) => {
    const commandName = args[1];
    const action = args[2];

    const command = bot.commands.get(commandName);
    const disabledCommand = await CommandsDisabled.findOne({
      commandName,
    });

    if (!["start", "stop", "restart"].includes(action)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы ввели неправильное действие. Доступные действия: start, stop, restart**`
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

    if (action === "restart") {
      // делаем рестарт команды
      delete require.cache[
        require.resolve(`../../commands/${command.category}/${command.name}.js`)
      ];
      bot.commands.delete(cmdname);
      const props = require(`../../commands/${command.category}/${command.name}.js`);
      bot.commands.set(command.name, props);
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor("DarkGreen")
            .setTitle(`📌 | Система управления командами!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**Команда \`${commandName}\` была успешно перезагружена!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (action === "start") {
      if (!disabledCommand) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Команда \`${commandName}\` не отключена**`
              )
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
      disabledCommand.remove();

      const command = require(`../${disabledCommand.category}/${commandName}.js`);
    }
  },
};
