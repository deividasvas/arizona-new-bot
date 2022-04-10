const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");
const Families = require("../../models/Families");

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

    if (family.deputies.length >= settings.limitDeputyInFamilies) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Максимальное количество заместителей семьи - ${settings.limitDeputyInFamilies} человек*`
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

    textFamilyChannel.permissionOverwrites.create(familyCandidateDeputy.id, {
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
              family.roleId
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
            `**Вы успешно назначили ${familyCandidateDeputy} на заместителя семьи <@&${family.roleId}>**`
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
      },
      familyCandidateDeputy.id,
      guild
    );
  },
};
