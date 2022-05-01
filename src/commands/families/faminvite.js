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
const settings = require("../../configs/settings");
const { rolesId } = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "faminvite", // название команды
  descr: "Пригласить в семью", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: () => {
    return getAllRolesIdFamilies(); // все айди семейных ролей
  }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь который будет принят в семью",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // аргументы

  async run({ bot, interaction, args, guild, author }) {
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
            .setColor(Colors.Red)
            .setFooter({
              text: `Robo Hamster`,
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
            .setColor(Colors.Red)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    const roles = candidate.roles.cache.values();
    let countFamsOfCandidate = roles.reduce((total, current) =>
      familiesIDs.includes(current.id) ? total + 1 : total
    ); // количество семей в которых состоит пользователь
    // const familiesIDs = allFamilies.map((family) => family.id);
    // for (const role of roles) {
    //   if (familiesIDs.includes(role.id)) {
    //     // проверяем имеет ли кандидат на выдачу семейной роли другие семейные роли
    //     countFamsOfCandidate++;
    //   }
    // }

    if (countFamsOfCandidate >= 2) {
      // если человек имеет более 2 семейные ролей, или 2 семейные роли, то больше нельзя выдавать.
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${candidate} уже состоит в двух семьях**`)
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

    if (candidate.roles.cache.some((role) => role.id === family.roleId)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${candidate} уже состоит в Вашей семье**`)
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

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Приглашение в семью!`)
          .setDescription(
            `Вы успешно отправили приглашение ${candidate} на вступлению в Вашу семью`
          )
          .setColor(Colors.DarkGreen)
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
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
              .setColor(Colors.DarkGreen)
              .setTimestamp()
              .setFooter({
                text: `Robo Hamster`,
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
                .setColor(Colors.Red)
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
        await sendUserMessage(
            {
              embeds: [
                await new EmbedBuilder()
                    .setTitle(`📌 | Приглашение в семью!`)
                    .setDescription(
                        `**${candidate} отклонил ваше приглашение в семью**`
                    )
                    .setColor(Colors.Red)
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
            .setColor(Colors.Red)
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
      }); // сделать эмбед с успешным принятием приглоса в семью
      sendUserMessage(
        {
          embeds: [
            new EmbedBuilder()
              .setTitle(`📌 | Приглашение в семью!`)
              .setDescription(
                `**${candidate} успешно принял ваше приглашение на вступление в семью**`
              )
              .setColor(Colors.Red)
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
        author.id,
        guild
      );

      candidate.roles.add(role, `Приглашения в фаму by ${author.user.tag}`);

      let logChannel =
        bot.channels.cache.get(settings.channelsId.famLogs) ||
        (await bot.channels.fetch(settings.channelsId.famLogs));

      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Приглашение в семью!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Семья: <@&${family.roleId}>\n「📌」Пригласил: ${author} \`[${author.id}]\`\n「👪」Приглашенный: ${candidate} \`[${candidate.id}]\`**`
            )
            .setFooter({
              text: "Robo Hamster",
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    });
  },
};
