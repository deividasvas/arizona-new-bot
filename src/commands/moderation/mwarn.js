const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
} = require("discord.js");
const downgradeModerator = require("../../components/downgradeModerator");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const removeModerator = require("../../components/removeModerator");
const setModerInfoParam = require("../../components/setModerInfoParam");
const setWarnsOrRebukes = require("../../components/setWarnsOrRebukes");
const {
  rolesId,
  channelsId,
  maxCountWarns,
  maxCountRebukes,
  fromPostToPostList,
} = require("../../configs/settings");

module.exports = {
  name: "mwarn", // название команды
  descr: "Выдать модератору предупреждение", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Модератор которому Вы хотите выдать предупреждение",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "причина",
      description: "Причина по которой Вы выдаёте модератору предупреждение",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => [
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
    const { immunities } = main;
    const punishModeratorsLogChannel = guild.channels.cache.get(
      channelsId.punishModeratorsLog
    );
    const warns = listWarnsAndRebukes.filter(
      (warnOrRebuke) => warnOrRebuke.group === "warn"
    ); // предупреждения в массиве

    const rebukes = listWarnsAndRebukes.filter(
      (warnOrRebuke) => warnOrRebuke.group === "rebuke"
    );

    if (immunities >= 1 && warns.length + 1 >= maxCountWarns) {
      // проверяем, есть ли у человека один или больше иммунитет, и если выдать это предупреждение, то автомачетиски выдастся ли выговор

      await setModerInfoParam(
        moderator.id,
        guild.id,
        "main",
        "immunities",
        ({ immunities }) => immunities - 1
      ); // снимаем один иммунитет

      await setWarnsOrRebukes(
        moderator.id,
        guild.id,
        rebukes // удаляем все предупреждения кроме выговоров
      );

      punishModeratorsLogChannel.send({
        content: `${author} ${moderator}`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Использование иммунитета!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Снял 1 имунитет: <@${author.id}>\n「🥶」Кому: <@${moderator.id}>\n「📕」Причина: \`Выдача выговора ${maxCountWarns}/${maxCountWarns} предупреждений\`\n「🌃」Причина последнего предупреждения: \`${reason}\`\n「⛔」Вам выдали выговор, но Вас спас иммунитет, будьте в следуйщий раз внимательней!**`
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
            .setColor("DarkGreen")
            .setTitle(`📌 | Использование иммунитета!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**У модератора ${moderator} накопилось ${
                warns.length + 1
              } из ${maxCountWarns} предупреждений, но у него имелся иммунитет который был снят. Везунчик..**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (
      warns.length + 1 >= maxCountWarns &&
      rebukes.length + 1 >= maxCountRebukes
    ) {
      /* предупреждение которое сейчас выдадут должно выдать модератору выговор
      и у модератора будет максимальное количество выговоров, следовательно, его
      нужно снять или понизить если он модератор и выше
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
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Система понижения!`)
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setDescription(
                  `**У модератора ${moderator} накопилось ${
                    warns.length + 1
                  } из ${maxCountWarns} предупреждений, по этой причине ему выдан выговор. Но, у него накопилось уже ${
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

      // если должность у пользователя - младший модератор, то снимаем его
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
            .setColor(Colors.DarkGreen)
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
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Система снятия модераторов!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**У модератора ${moderator} накопилось ${
                warns.length + 1
              } из ${maxCountWarns} предупреждений и ${maxCountRebukes} из ${maxCountRebukes} выговоров. Модератор снят.**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    if (warns.length + 1 >= maxCountWarns) {
      // предупреждение которое выдадут сейчас должно выдать модератору выговор

      await setWarnsOrRebukes(moderator.id, guild.id, ({ warns }) => {
        return [
          ...warns.filter((warnOrRebuke) => warnOrRebuke.group === "rebuke"),
          {
            group: "rebuke",
            reason: `${maxCountWarns}/${maxCountWarns} предупреждений`,
            initiatorId: author.id,
          },
        ];
      }); // заносим выговор в базу данных

      punishModeratorsLogChannel.send({
        content: `${author} ${moderator}`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Система выдачи выговоров!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**「📝」Выдал: <@${
                author.id
              }>\n「🥶」Кому: ${moderator}\n「📕」Причина: \`${
                warns.length + 1
              }/${maxCountWarns} предупреждений\`\n「⛔」Причина последнего предупреждения: \`${reason}\`\n「😿」Теперь у него ${
                listWarnsAndRebukes.filter(
                  (warnOrRebuke) => warnOrRebuke.group === "rebuke"
                ).length + 1
              } выговоров**`
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
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Система выдачи выговоров!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(
              `**У модератора ${moderator} накопилось ${
                warns.length + 1
              } из ${maxCountWarns} предупреждений, по этой причине ему выдан выговор.**`
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
          group: "warn",
          reason,
          initiatorId: author.id,
        },
      ];
    }); // заносим предупреждение в базу данных
    punishModeratorsLogChannel.send({
      content: `${author} ${moderator}`,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система выдачи предупреждения!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Выдал: <@${
              author.id
            }>\n「🥶」Кому: ${moderator}\n「📕」Причина: \`${reason}\`\n「😿」Теперь у него ${
              warns.length + 1
            } предупреждения(ий)**`
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
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система выдачи предупреждения!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно выдали предупреждение модератору ${moderator} по причине \`${reason}\`. Теперь у него \`${
              warns.length + 1
            }\` предупреждения(ий)**`
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
