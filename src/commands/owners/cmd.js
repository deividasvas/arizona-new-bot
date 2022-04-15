const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
} = require("discord.js");
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
      name: "команда",
      description: "Название команды с которой Вы производите действия",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "действие",
      description: "Действие которое Вы хотите произвести",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "restart",
          value: "restart",
        },
        {
          name: "start",
          value: "start",
        },
        {
          name: "stop",
          value: "stop",
        },
      ],
      required: true,
    },
  ], // аргументы

  run: async ({
    bot,
    interaction,
    channel,
    args,
    guild,
    developers,
    author,
  }) => {
    const commandName = args[0];
    const action = args[1];

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
      console.log(command);
      delete require.cache[
        require.resolve(`../../commands/${command.category}/${command.name}.js`)
      ];
      bot.commands.delete(commandName);
      const props = require(`../../commands/${command.category}/${command.name}.js`);
      bot.commands.set(command.name, props);
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
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
              .setDescription(`**Команда \`${commandName}\` не отключена**`)
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
      disabledCommand.remove();

      const command = require(`../${disabledCommand.commandCategory}/${commandName}.js`);
      if (command.showInSlashCommands) {
        bot.commands.set(command.name, {
          ...command,
          category: disabledCommand.commandCategory,
        });
        bot.loadSlashCommand(command, guild);
      }
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`📌 | Запуск команды`)
            .setDescription(`**Команда \`${commandName}\` успешно запущена**`)
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

    if (action === "stop") {
      if (disabledCommand) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Команда \`${commandName}\` находится в состояний - отключена**`
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

      const command = bot.commands.get(commandName);
      bot.commands.delete(commandName);
      if (command.showInSlashCommands) {
        const commandGuild = guild.commands.cache.find(
          (cmd) => cmd.name === command.name
        );
        bot.deleteSlashCommand(commandGuild.id, guild);
      }
      new CommandsDisabled({
        commandName,
        provocateurId: author.id,
        commandCategory: command.category,
      }).save();
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`📌 | Выключение команды`)
            .setDescription(`**Команда \`${commandName}\` успешно выключена**`)
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
  },
};
