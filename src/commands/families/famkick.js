const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");
const log = require("../../components/log");

module.exports = {
  name: "famkick", // название команды
  descr: "Исключить человека из семьи", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь который будет исключен из семьи",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // список аргументов
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  async run({ bot, interaction, channelsId, author, args, guild }) {
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
    }); // семья в которой может быть человек владельцем или заместителем
    const familyCandidateForKick =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не являетесь владельцем или заместителем семьи**`
            )
            .setColor(Colors.Blue)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    if (author.id === familyCandidateForKick.id) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Невозможно исключить самого себя из семьи**`)
            .setColor(Colors.Blue)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    if (
      !familyCandidateForKick.roles.cache.some(
        (role) => role.id === family.roleId
      )
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${familyCandidateForKick} не состоит в Вашей семье**`
            )
            .setColor(Colors.Blue)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    familyCandidateForKick.roles.remove(family.roleId);
    const logFamiliesChannel = guild.channels.cache.get(
      channelsId.famLogs
    ); // лог семей
    logFamiliesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkRed)
          .setTitle(`📌 | Исключение из семьи!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Семья: <@&${family.roleId}>\n「📌」Лидер: ${author} \`[${
              author.id
            }]\n「🧍」Заместители семьи: ${
              family.deputies.length > 0
                ? family.deputies.map((deputy) => `<@${deputy.userId}>`)
                : "-"
            }\n「👪」Исключил: ${familyCandidateForKick} \`[${
              familyCandidateForKick.id
            }]\`**`
          )
          .setFooter({
            text: "Robo Hamster",
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    const role = guild.roles.cache.find((role) => role.id === family.roleId);
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkRed)
          .setTitle(`📌 | Исключение из семьи!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно исключили ${familyCandidateForKick} из семьи \`\`${role.name}\`\` **`
          )
          .setFooter({
            text: "Robo Hamster",
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    sendUserMessage(
      {
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(`📌 | Исключение из семьи!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**Вы были исключены из семьи \`\`${role.name}\`\` её руководителем ${author}**`
            )
            .setFooter({
              text: "Robo Hamster",
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      },
      familyCandidateForKick.id,
      guild
    );
    log(29, {
      guildId: guild.id, // ID сервера
      discordId: familyCandidateForKick.id, // ID упомянутого участника
      discordTag: familyCandidateForKick.user.tag, // Tag упомянутого участника
      discordNick: familyCandidateForKick.displayName, // Серверный ник упомянутого участника
      moderatorId: author.id, // ID автора сообщения
      moderatorTag: author.user.tag, // Tag автора сообщения
      moderatorNick: author.displayName, // Серверный ник автора сообщения
      roleId: role.id,
      roleName: role.name,
      value: role.id
    })
  },
};
