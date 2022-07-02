const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  Colors,
} = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const getTwoHourInMs = require("../../components/getTwoHourInMs");
const sendUserMessage = require("../../components/sendUserMessage");
const Families = require("../../models/Families");
const getAllRolesIdAdmins = require('../../components/getAllRolesIdAdmins')
const log = require("../../components/log");
const settings = require("../../configs/settings");

module.exports = {
  name: "faminvite", // название команды
  descr: "Пригласить в семью", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь который будет принят в семью",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // аргументы

  async run({ bot, interaction, args, guild, author, channelsId, rolesId }) {
    let candidate = guild.members.cache.get(args[0]);
    const allFamilies = await Families.find();
    let family = await Families.findOne({
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

    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не являетесь лидером/заместителем семьи!**`)
            .setColor(Colors.Blue)
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (candidate.id === author.user.id) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не можете пригласить самого себя в семью!**`)
            .setColor(Colors.Blue)
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    const allAdminsRolesId = getAllRolesIdAdmins(rolesId);
    // Если у человека имеются админские роли, то выдаем ему ошибку.
    if(candidate.roles.cache.some(role => allAdminsRolesId.includes(role.id))){
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${candidate} является администратором!\nРуководство сервера запретило администрации находиться в семьях!**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    const familiesRolesId = allFamilies.map((family) => family.id);
    const roles = [...candidate.roles.cache];
    let countFamsOfCandidate = roles.reduce((total, current) =>
      familiesRolesId.includes(current.id) ? total + 1 : total
    ); // количество семей в которых состоит пользователь

    if (countFamsOfCandidate >= 2) {
      // если человек имеет более 2 семейные ролей, или 2 семейные роли, то больше нельзя выдавать.
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${candidate} уже состоит в двух семьях**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (candidate.roles.cache.some((role) => role.id === family.roleId)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${candidate} уже состоит в Вашей семье**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Приглашение в семью!`)
          .setDescription(
            `**Вы успешно отправили приглашение ${candidate} на вступлению в Вашу семью!**`
          )
          .setColor(Colors.Blue)
          .setTimestamp()
          .setFooter({
            text: `Surprise Bot`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });

    const messageForCandidate = await sendUserMessage(
      {
        embeds: [
          await new EmbedBuilder()
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setTitle(`📌 | Вы были приглашены в семью!`)
              .setDescription(
                  `**「📝」Семья: \`${
                      guild.roles.cache.get(family.roleId).name
                  }\`\n「📌」Лидер: ${author} \`[${
                      author.user.id
                  }]\`\n「🧍」Заместители семьи: ${
                      family.deputies.length > 0
                          ? family.deputies.map((deputy) => `<@${deputy.userId}>`)
                          : "-"
                  }\`\`[${family.deputies.length}/${
                      settings.limitDeputyInFamilies
                  }]\`\`\n「📕」Дополнительно: \`У Вас есть два часа на рассмотрение предложения\`**`
              )
              .setColor(Colors.Blue)
              .setTimestamp()
              .setFooter({
                text: `Surprise Bot`,
                iconURL: bot.user.displayAvatarURL(),
              }),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("famYes")
              .setLabel(`Принять`)
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId("famNo")
              .setLabel(`Отказать`)
              .setStyle(ButtonStyle.Danger)
          ),
        ],
      },
      candidate.id,
      guild
    );
    const filter = (i) =>
      i.user.id == candidate.id &&
      (i.customId === "famYes" || i.customId == "famNo");
    const collector = await messageForCandidate.createMessageComponentCollector(
      {
        time: getTwoHourInMs(),
        max: 1,
        filter,
      }
    );

    let role =
      guild.roles.cache.find((role) => role.id == family.roleId) ||
      (await guild.roles.fetch(family.roleId)); // Поиск роли
    if (!role) {
      return await interaction.editReply({
        content: `**Роль не найдена на сервере, сообщите разработчикам!\nID: ${family.roleId}**`,
        components: [],
        embeds: [],
      }); // сделать эмбед с ошибкой выше
    }

    collector.on("collect", async (interaction) => {
      if (
        interaction.customId == "famNo" &&
        interaction.user.id == candidate.id
      ) {
        await interaction.deferUpdate();
        await interaction.editReply({
          components: [],
          embeds: [
            await new EmbedBuilder()
                .setTitle(`📌 | Приглашение в семью!`)
                .setDescription(
                    `**Вы успешно отклонили приглашение в семью \`\`${role.name}\`\`**`
                )
                .setColor(Colors.Blue)
                .setTimestamp()
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setFooter({
                  text: `Surprise Bot`,
                  iconURL: bot.user.displayAvatarURL(),
                }),
          ],
        });
        await sendUserMessage(
            {
              embeds: [
                await new EmbedBuilder()
                    .setTitle(`📌 | Приглашение в семью!`)
                    .setDescription(
                        `**${candidate} отклонил ваше приглашение в семью**`
                    )
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                      name: guild.name,
                      iconURL: guild.iconURL(),
                    })
                    .setFooter({
                      text: `Surprise Bot`,
                      iconURL: bot.user.displayAvatarURL(),
                    }),
              ],
            },
            author.id,
            guild
        );
      }
      await interaction.deferUpdate();

      await interaction.editReply({
        components: [],
        embeds: [
          new EmbedBuilder()
            .setTitle(`📌 | Приглашение в семью!`)
            .setDescription(
              `**Вы успешно приняли приглашение в семью \`\`${role.name}\`\`**`
            )
            .setColor(Colors.Blue)
            .setTimestamp()
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      }); // сделать эмбед с успешным принятием приглоса в семью
      sendUserMessage(
        {
          embeds: [
            new EmbedBuilder()
              .setTitle(`📌 | Приглашение в семью!`)
              .setDescription(
                `**${candidate} успешно принял ваше приглашение на вступление в семью**`
              )
              .setColor(Colors.Blue)
              .setTimestamp()
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Surprise Bot`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
        },
        author.id,
        guild
      );

      candidate.roles.add(role, `Приглашения в фаму by ${author.user.tag}`);

      log(28, {
        guildId: guild.id, // ID сервера
        discordId: candidate.id, // ID упомянутого участника
        discordTag: candidate.user.tag, // Tag упомянутого участника
        discordNick: candidate.displayName, // Серверный ник упомянутого участника
        moderatorId: author.id, // ID автора сообщения
        moderatorTag: author.user.tag, // Tag автора сообщения
        moderatorNick: author.displayName, // Серверный ник автора сообщения
        roleId: role.id,
        roleName: role.name,
        value: role.id
      })

      let logChannel =
        bot.channels.cache.get(channelsId.famLogs) ||
        (await bot.channels.fetch(channelsId.famLogs));

      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Приглашение в семью!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Семья: <@&${family.roleId}>\n「📌」Пригласил: ${author} \`[${author.id}]\`\n「👪」Приглашенный: ${candidate} \`[${candidate.id}]\`**`
            )
            .setFooter({
              text: "Surprise Bot",
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    });
  },
};
