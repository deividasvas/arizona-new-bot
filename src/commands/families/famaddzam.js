const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");

module.exports = {
  name: "famaddzam", // название команды
  descr: "Поставить заместителя в семье", // описание команды
  private: false, // ограничена в использовании
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      type: ApplicationCommandOptionType.User,
      description: "Пользователь который будет назначен заместителем",
      required: true,
    },
  ], // аргументы
  run: async ({ bot, interaction, author, args, guild }) => {
    const familyCandidateDeputy =
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

    if (family.zam_id !== "0") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**В семье уже существует заместитель - <@${family.zam_id}> **`
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

    const candidate_owner = await bot.connection(
      `SELECT * FROM \`families\` WHERE \`owner_id\` = '${familyCandidateDeputy.user.id}'`
    );

    const candidate_deputy = await bot.connection(
      `SELECT * FROM \`families\` WHERE \`zam_id\` = '${familyCandidateDeputy.user.id}'`
    );

    if (candidate_owner.length !== 0) {
      return interaction.reply({
        ephemeral: true,
        content: `**${familyCandidateDeputy} является владельцем ${guild.roles.cache.get(
          candidate_owner[0].role_id
        )}!**`,
      });
    }

    if (candidate_deputy.length !== 0) {
      return interaction.reply({
        ephemeral: true,
        content: `**${familyCandidateDeputy} является заместителем ${guild.roles.cache.get(
          candidate_deputy[0].role_id
        )}!**`,
      });
    }

    await guild.members.cache
      .get(familyCandidateDeputy.id)
      .roles.add(family.role_id);
    await bot.connection(
      `UPDATE \`families\` SET \`zam_id\` = ${familyCandidateDeputy.id} WHERE \`role_id\` = ${family.role_id} `
    );
    const role = guild.roles.cache.get(family.role_id);
    let text_family_ch =
      guild.channels.cache.get(family.text_channel_id) ||
      (await guild.channels.fetch(text_channel_id));
    text_family_ch.permissionOverwrites.create(familyCandidateDeputy.id, {
      ViewChannel: true,
      SendMessages: true,
      EmbedLinks: true,
      AttachFiles: true,
      ReadMessageHistory: true,
      UseExternalEmojis: true,
      AddReactions: true,
    });

    const logFamiliesChannel = guild.channels.cache.get(
      settings.channelsID.famLogs
    ); // лог семей
    logFamiliesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Назначение заместителя`)
          .setDescription(
            `**「📝」Семья: ${guild.roles.cache.get(
              family.role_id
            )}\n「📌」Лидер: ${author} \`[${
              author.id
            }]\`\n「👪」Поставили: ${familyCandidateDeputy} \`[${
              familyCandidateDeputy.id
            }]\`**`
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

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Назначение заместителя`)
          .setDescription(
            `**Вы успешно назначили ${familyCandidateDeputy} на заместителя семьи <@&${family.role_id}>**`
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
    sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Новая должность`)
          .setDescription(
            `**Вы были успешно назначены на должность заместителя семьи \`\`${role.name}\`\`**`
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
    }, familyCandidateDeputy.id, guild);
  },
};
