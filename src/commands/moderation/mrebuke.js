const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
} = require("discord.js");
const downgradeModerator = require("../../components/downgradeModerator");
const getModerInfo = require("../../components/getModerInfo");
const removeModerator = require("../../components/removeModerator");
const setModerInfoParam = require("../../components/setModerInfoParam");
const setWarnsOrRebukes = require("../../components/setWarnsOrRebukes");
const {
  rolesId,
  channelsId,
  maxCountRebukes,
  fromPostToPostList,
} = require("../../configs/settings");

module.exports = {
  name: "mrebuke", // название команды
  descr: "Выдать модератору выговор", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Модератор которому Вы хотите выдать выговоро",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "причина",
      description: "Причина по которой Вы выдаёте модератору выговор",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: (rolesId) => [
    rolesId.discordMaster, // discord master
    rolesId.juniorDiscordMaster, // jr.discord master
    rolesId.adviceAdministration, // совет администрации дискорда
    rolesId.curatorModeration, // куратор модерации
  ], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const moderator =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const reason = args[1];
    const {
      error,
      warns: listWarnsAndRebukes,
      main,
    } = await getModerInfo(bot, guild.id, moderator.id);
    if (error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${moderator} не является модератором. Если это не так, то обратитесь к <@&${rolesId.techSection}>**`
            )
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
    const { immunities } = main;
    const punishModeratorsLogChannel = guild.channels.cache.get(
      channelsId.punishModeratorsLog
    );

    const rebukes = listWarnsAndRebukes.filter(
      (warnOrRebuke) => warnOrRebuke.group === "rebuke"
    );

    if (immunities >= 1) {
      // проверяем, есть ли у человека один или больше иммунитет, если есть, то снимаем его вместо выговора

      await setModerInfoParam(
        moderator.id,
        guild.id,
        "main",
        "immunities",
        ({ immunities }) => immunities - 1
      ); // снимаем один иммунитет

      punishModeratorsLogChannel.send({
        content: `${author} ${moderator}`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Использование иммунитета!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Снял 1 имунитет: <@${author.id}>\n「🥶」Кому: <@${moderator.id}>\n「📕」Причина: \`Выдача выговора\`\n「🌃」Причина выговора: \`${reason}\`\n「⛔」Вам выдали выговор, но Вас спас иммунитет, будьте в следуйщий раз внимательней!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Использование иммунитета!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**Вы успешно выдали модератору ${moderator} выговор, но у него имелся иммунитет который был снят. Везунчик..**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (rebukes.length + 1 >= maxCountRebukes) {
      /* выговор который сейчас выдадут будет максимальным, и у модератора будет 3/3, соответственно, его нужно либо понизить либо снять.
       */

      // пытаемся сначала понизить пользователя на должность ниже
      for (const post of fromPostToPostList) {
        if (
          moderator.roles.cache.some(
            (role) => role.id === post.fromRoleId // если у пользователя имеется роль с которой мы хотим его понизить, то понижаем
          )
        ) {
          await downgradeModerator(
            bot,
            guild.id,
            moderator.id,
            author.id,
            post.fromRoleId,
            post.toRoleId,
            reason
          ); // понижаем пользователя

          punishModeratorsLogChannel.send({
            content: `${author} ${moderator}`,
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setTitle(`📌 | Система выдачи выговоров!`)
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setDescription(
                  `**「📝」Выдал: <@${
                    author.id
                  }>\n「🥶」Кому: ${moderator}\n「📕」Причина: \`${reason}\`\n「😿」Теперь у него ${
                    rebukes.length + 1
                  } выговор(ов)\n 「🔴」__МОДЕРАТОР ПОНИЖЕН__!!**`
                )
                .setTimestamp()
                .setFooter({
                  text: `Robo Hamster`,
                  iconURL: bot.user.displayAvatarURL(),
                }),
            ],
          });

          return interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setTitle(`📌 | Система понижения!`)
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setDescription(
                  `**У модератора ${moderator} накопилось ${
                    rebukes.length + 1
                  } из ${maxCountRebukes} выговоров, поэтому, он был понижен до должности <@&${
                    post.toRoleId
                  }>**`
                )
                .setTimestamp()
                .setFooter({
                  text: `Robo Hamster`,
                  iconURL: bot.user.displayAvatarURL(),
                }),
            ],
          });
        }
      }
      await setWarnsOrRebukes(moderator.id, guild.id, ({ warns }) => {
        return [
          ...warns,
          {
            group: "rebuke",
            reason,
            initiatorId: author.id,
          },
        ];
      }); // заносим выговор в базу данных чтоб отобразилось в статистике снятия 3/3
      // если должность у пользователя - младший модератор, то снимаем его
      await removeModerator(bot, guild.id, moderator.id);
      punishModeratorsLogChannel.send({
        content: `${author} ${moderator}`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Система выдачи выговоров!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Выдал: <@${
                author.id
              }>\n「🥶」Кому: ${moderator}\n「📕」Причина: \`${reason}\`\n「😿」Теперь у него ${
                rebukes.length + 1
              } выговор(ов)\n 「🔴」__МОДЕРАТОР СНЯТ__!!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(`📌 | Система выдачи выговора!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**У модератора ${moderator} накопилось ${maxCountRebukes} из ${maxCountRebukes} выговоров. Модератор снят.**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    await setWarnsOrRebukes(moderator.id, guild.id, ({ warns }) => {
      return [
        ...warns,
        {
          group: "rebuke",
          reason,
          initiatorId: author.id,
        },
      ];
    }); // заносим выговор в базу данных
    punishModeratorsLogChannel.send({
      content: `${author} ${moderator}`,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`📌 | Система выдачи выговоров!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Выдал: <@${
              author.id
            }>\n「🥶」Кому: ${moderator}\n「📕」Причина: \`${reason}\`\n「😿」Теперь у него ${
              rebukes.length + 1
            } выговор(ов)**`
          )
          .setTimestamp()
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
          .setColor(Colors.Blue)
          .setTitle(`📌 | Система выдачи выговоров!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно выдали выговор модератору ${moderator} по причине \`${reason}\`. Теперь у него \`${
              rebukes.length + 1
            }\` выговор(ов)**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
