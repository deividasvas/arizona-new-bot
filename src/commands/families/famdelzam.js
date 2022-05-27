const { ApplicationCommandOptionType, Colors } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "famdelzam", // название команды
  descr: "Убрать заместителя из семьи", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      type: ApplicationCommandOptionType.User,
      description: "Пользователь который будет снят с заместителя",
      required: true,
    },
  ], // аргументы
  async run({ bot, interaction, author, args, guild, channelsId }) {
    const familyCandidateForRemoveOfDeputy =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const family = await Families.findOne({
      ownerId: author.user.id,
    });

    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не являетесь владельцем семьи**`)
            .setColor(Colors.Blue)
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
    if (
      !family.deputies.find(
        (deputy) => deputy.userId === familyCandidateForRemoveOfDeputy.id
      )
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${familyCandidateForRemoveOfDeputy} не является заместителем семьи**`
            )
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            })
            .setColor(Colors.Blue),
        ],
      });
    }
    const role = guild.roles.cache.get(family.roleId);
    const textChannel = guild.channels.cache.get(family.textChannelId);
    try {
      textChannel.permissionOverwrites.cache
        .get(familyCandidateForRemoveOfDeputy.id)
        .delete();
      // удаляем права заместителю на просмотр и отправку сообщений в канал.
    } catch (e) {}
    const logFamiliesChannel = guild.channels.cache.get(
      channelsId.famLogs
    ); // лог семей
    await Families.updateOne(
      {
        roleId: family.roleId,
      },
      {
        $pull: {
          deputies: {
            userId: familyCandidateForRemoveOfDeputy.id,
          },
        },
      }
    ); // удаляем заместителя из семьи
    logFamiliesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Снятие заместителя!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Семья: ${role}\n「📌」Лидер: ${author} \`[${
              author.id
            }]\`\n「🧍」Заместители семьи: ${
              family.deputies.length > 0
                ? family.deputies.map((deputy) => `<@${deputy.userId}>`)
                : "-"
            }\`\`[${family.deputies.length}/${
              settings.limitDeputyInFamilies
            }]\`\`「👪」Поставили: ${familyCandidateForRemoveOfDeputy} \`[${
              familyCandidateForRemoveOfDeputy.id
            }]\`**`
          )
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: "Robo Hamster",
            iconURL: bot.user.displayAvatarURL(),
          })
          .setColor(Colors.Blue),
      ],
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setTitle(`📌 | Снятие заместителя`)
          .setDescription(
            `**Вы успешно сняли заместителя ${familyCandidateForRemoveOfDeputy} с семьи ${role} **`
          )
          .setColor(Colors.Blue)
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
    sendUserMessage(
      {
        embeds: [
          new EmbedBuilder()
            .setTitle(`📌 | Понижения в должности`)
            .setDescription(
              `**Вы были сняты с должности заместителя семьи \`\`${role.name}\`\`**`
            )
            .setColor(Colors.Blue)
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
      },
      familyCandidateForRemoveOfDeputy.id,
      guild
    );
  },
};
