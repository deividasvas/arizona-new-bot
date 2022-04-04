const { MessageEmbed, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");

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
    const family = (
      await bot.connection(
        `SELECT * FROM \`families\` WHERE \`owner_id\` = '${author.user.id}'`
      )
    )[0];

    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не являетесь владельцем семьи**`)
            .setColor(`RED`)
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
    if (family.zam_id !== familyCandidateForRemoveOfDeputy.id) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${familyCandidateForRemoveOfDeputy} не является заместителем семьи**`
            )
            .setColor(`RED`)
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
    await textChannel.permissionOverwrites.cache
      .get(familyCandidateForRemoveOfDeputy.id)
      .delete()
      .catch(() => {});
    const logFamiliesChannel = guild.channels.cache.get(
      settings.channelsID.famLogs
    ); // лог семей
    await bot.connection(
      `UPDATE \`families\` SET \`zam_id\` = '0' WHERE \`owner_id\` = '${author.id}'`
    );
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
            `**「📝」Семья: ${role}\n「📌」Лидер: ${author} \`[${author.id}]\`\n「👪」Поставили: ${familyCandidateForRemoveOfDeputy} \`[${familyCandidateForRemoveOfDeputy.id}]\`**`
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
          .setColor(`DARK_GREEN`)
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
    sendUserMessage({
      embeds: [
        new MessageEmbed()
          .setTitle(`📌 | Понижения в должности`)
          .setDescription(
            `**Вы были сняты с должности заместителя семьи \`\`${role.name}\`\`**`
          )
          .setColor(`DARK_GREEN`)
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
    }, familyCandidateForRemoveOfDeputy.id, guild);
  },
};
