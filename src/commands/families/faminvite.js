const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const getTwoHourInMs = require("../../components/getTwoHourInMs");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");

module.exports = {
  name: "faminvite", // название команды
  descr: "Пригласить в семью", // описание команды
  private: false, // ограничена в использовании
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь который будет принят в семью",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // аргументы

  run: async ({ bot, interaction, args, guild, author }) => {
    let candidate = guild.members.cache.get(args[0]);
    const allFamilies = await bot.connection("SELECT * FROM `families`");
    let family = (
      await bot.connection(
        `SELECT * FROM \`families\` WHERE \`owner_id\` = '${author.user.id}' OR \`zam_id\` = '${author.user.id}'`
      )
    )[0]; // семья в которой может быть человек владельцем

    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не являетесь лидером/заместителем семьи!**`)
            .setColor(`Red`)
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
            .setColor(`Red`)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    let countFamsOfCandidate = 0; // количество семей в которых состоит пользователь
    const roles = candidate.roles.cache.values();
    const familiesIDs = allFamilies.map((family) => family.id);
    for (const role of roles) {
      if (familiesIDs.includes(role.id)) {
        // проверяем имеет ли кандидат на выдачу семейной роли другие семейные роли
        countFamsOfCandidate++;
      }
    }

    if (countFamsOfCandidate >= 2) {
      // если человек имеет более 2 семейные ролей, или 2 семейные роли, то больше нельзя выдавать.
      return interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder()],
      });
    }

    if (candidate.roles.cache.some((role) => role.id === family.role_id)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${candidate} уже состоит в Вашей семье**`
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

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Приглашение в семью!`)
          .setDescription(
            `Вы успешно отправили приглашение ${candidate} на вступлению в Вашу семью`
          )
          .setColor(`DarkGreen`)
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
          new EmbedBuilder()
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setTitle(`📌 | Вы были приглашены в семью!`)
            .setDescription(
              `**「📝」Семья: \`${
                guild.roles.cache.get(family.role_id).name
              }\`\n「📌」Лидер: ${author} \`[${author.user.id}]\`${
                family.zam_id !== "0"
                  ? `\n「🧍」Заместитель семьи: <@${family.zam_id}> \`[${family.zam_id}]`
                  : ""
              }\n「📕」Дополнительно: \`У Вас есть два часа на рассмотрение предложения\`**`
            )
            .setColor(`DarkGreen`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("fam_yes")
              .setLabel(`Принять`)
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId("fam_no")
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
      (i.customId === "fam_yes" || i.customId == "fam_no");
    const collector = await messageForCandidate.createMessageComponentCollector(
      {
        time: getTwoHourInMs(),
        max: 1,
        filter,
      }
    );

    let role =
      guild.roles.cache.find((role) => role.id == family.role_id) ||
      (await guild.roles.fetch(family.role_id)); // Поиск роли
    if (!role) {
      return await interaction.editReply({
        content: `**Роль не найдена на сервере, сообщите разработчикам!\nID: ${family.role_id}**`,
        components: [],
        embeds: [],
      }); // сделать эмбед с ошибкой выше
    }

    collector.on("collect", async (interaction) => {
      if (
        interaction.customId == "fam_no" &&
        interaction.user.id == candidate.id
      ) {
        await interaction.deferUpdate();
        await interaction.editReply({
          components: [],
          embeds: [
            new EmbedBuilder()
              .setTitle(`📌 | Приглашение в семью!`)
              .setDescription(
                `**Вы успешно отклонили приглашение в семью \`\`${role.name}\`\`**`
              )
              .setColor(`Red`)
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
                .setTitle(`📌 | Приглашение в семью!`)
                .setDescription(
                  `**${candidate} отклонил ваше приглашение в семью**`
                )
                .setColor(`Red`)
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
            .setColor(`Red`)
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
              .setColor(`Red`)
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

      let log_channel =
        bot.channels.cache.get(settings.channelsID.famLogs) ||
        (await bot.channels.fetch(settings.channelsID.famLogs));

      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("DarkGreen")
            .setTitle(`📌 | Приглашение в семью!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Семья: <@&${family.role_id}>\n「📌」Пригласил: ${author} \`[${author.id}]\`\n「👪」Приглашенный: ${candidate} \`[${candidate.id}]\`**`
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
