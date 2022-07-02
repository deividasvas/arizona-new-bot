const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getAllRolesIdFamilies = require("../../components/getAllRolesIdFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");
const log = require("../../components/log");

module.exports = {
  name: "famaddzam", // название команды
  descr: "Поставить заместителя в семье", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "пользователь",
      type: ApplicationCommandOptionType.User,
      description: "Пользователь который будет назначен заместителем",
      required: true,
    },
  ], // аргументы
  async run({ bot, interaction, author, args, guild, channelsId }){
    const familyCandidateDeputy =
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
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if(family.deputies.find(deputy => deputy.userId === familyCandidateDeputy.id)){
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${familyCandidateDeputy} уже является заместителем в семье**`)
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

    if (family.deputies.length >= settings.limitDeputyInFamilies) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Максимальное количество заместителей семьи - ${settings.limitDeputyInFamilies} человек*`
            )
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

    const familyCandidate = await Families.findOne({
      $or: [
        {
          ownerId: familyCandidateDeputy.id,
        },
        {
          deputies: {
            $in: [
              {
                userId: familyCandidateDeputy.id,
              },
            ],
          },
        },
      ],
    });

    if (familyCandidate) {
      return interaction.reply({
        ephemeral: true,
        content: `**${familyCandidateDeputy} является владельцем или заместителем семьи <@&${familyCandidate.roleId}>!**`,
      });
    }

    await guild.members.cache
      .get(familyCandidateDeputy.id)
      .roles.add(family.roleId);

    await Families.updateOne(
      {
        roleId: family.roleId,
      },
      {
        $push: {
          deputies: {
            userId: familyCandidateDeputy.id,
          },
        },
      }
    ); // добавляем заместителя в семью
    const role = guild.roles.cache.get(family.roleId);
    let textFamilyChannel =
      guild.channels.cache.get(family.textChannelId) ||
      (await guild.channels.fetch(textChannelId));

    await textFamilyChannel.permissionOverwrites.create(familyCandidateDeputy.id, {
      ViewChannel: true,
      SendMessages: true,
      EmbedLinks: true,
      AttachFiles: true,
      ReadMessageHistory: true,
      UseExternalEmojis: true,
      AddReactions: true,
    });

    const logFamiliesChannel = guild.channels.cache.get(
      channelsId.famLogs
    ); // лог семей
    logFamiliesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Назначение заместителя`)
          .setDescription(
            `**「📝」Семья: ${guild.roles.cache.get(
              family.roleId
            )}\n「📌」Лидер: ${author} \`[${
              author.id
            }]\`\n「👪」Поставили: ${familyCandidateDeputy} \`[${
              familyCandidateDeputy.id
            }]\`**`
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

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Назначение заместителя`)
          .setDescription(
            `**Вы успешно назначили ${familyCandidateDeputy} на заместителя семьи <@&${family.roleId}>**`
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
            new EmbedBuilder()
                .setTitle(`📌 | Новая должность`)
                .setDescription(
                    `**Вы были успешно назначены на должность заместителя семьи \`\`${role.name}\`\`**`
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
        familyCandidateDeputy.id,
        guild
    );

    log(26, {
      guildId: guild.id, // ID сервера
      discordId: familyCandidateDeputy.id, // ID упомянутого участника
      discordTag: familyCandidateDeputy.user.tag, // Tag упомянутого участника
      discordNick: familyCandidateDeputy.displayName, // Серверный ник упомянутого участника
      moderatorId: author.id, // ID автора сообщения
      moderatorTag: author.user.tag, // Tag автора сообщения
      moderatorNick: author.displayName, // Серверный ник автора сообщения
      roleId: role.id,
      roleName: role.name,
      value: role.id
    })
  },
};
