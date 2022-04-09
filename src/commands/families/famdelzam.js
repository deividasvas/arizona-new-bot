const { ApplicationCommandOptionType, Colors } = require("discord.js");
const { EmbedBuilder } = require("discord.js/node_modules/@discordjs/builders");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "famdelzam", // название команды
  descr: "Убрать заместителя из семьи", // описание команды
  private: false, // ограничена в использовании
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      type: ApplicationCommandOptionType.User,
      description: "Пользователь который будет снят с заместителя",
      required: true,
    },
  ], // аргументы
  run: async ({ bot, interaction, author, args, guild }) => {
    const familyCandidateForRemoveOfDeputy =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const family = await Families.findOne({
      owner_id: author.user.id,
    });

    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не являетесь владельцем семьи**`)
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
    if (
      !family.deputies.find(
        (deputy) => deputy.user_id === familyCandidateForRemoveOfDeputy.id
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
            }),
        ],
      });
    }
    const role = guild.roles.cache.get(family.role_id);
    const textChannel = guild.channels.cache.get(family.text_channel_id);
    try {
      textChannel.permissionOverwrites.cache
        .get(familyCandidateForRemoveOfDeputy.id)
        .delete();
      // удаляем права заместителю на просмотр и отправку сообщений в канал.
    } catch (e) {}
    const logFamiliesChannel = guild.channels.cache.get(
      settings.channelsID.famLogs
    ); // лог семей
    await Families.updateOne(
      {
        role_id: family.role_id,
      },
      {
        $pull: {
          deputies: {
            user_id: familyCandidateForRemoveOfDeputy.id,
          },
        },
      }
    ); // удаляем заместителя из семьи
    logFamiliesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#39FE7B")
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
                ? family.deputies.map((deputy) => `<@${deputy.user_id}>`)
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
          }),
      ],
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setTitle(`📌 | Снятие заместителя`)
          .setDescription(
            `**Вы успешно сняли заместителя ${familyCandidateForRemoveOfDeputy} с семьи ${role} **`
          )
          .setColor(`DarkGreen`)
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
          new MessageEmbed()
            .setTitle(`📌 | Понижения в должности`)
            .setDescription(
              `**Вы были сняты с должности заместителя семьи \`\`${role.name}\`\`**`
            )
            .setColor(`DarkGreen`)
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
