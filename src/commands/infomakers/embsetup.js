const {
  EmbedBuilder,
  Colors,
  ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdInfoMakers = require("../../components/getAllRolesIdInfomakers");
const InfomakerEmbed = require("../../models/InfomakerEmbed");
const choices = [
  // подсказки к аргументу
  {
    name: "Название",
    value: `1`,
  },
  {
    name: "Описание",
    value: `2`,
  },
  {
    name: "Цвет",
    value: `3`,
  },
  {
    name: "Время",
    value: `4`,
  },
  {
    name: "Картинка",
    value: `5`,
  },
  {
    name: "Подпись",
    value: `6`,
  },
  {
    name: "Картинка к подписи",
    value: `7`,
  },
  {
    name: "Заголовок 'Author'",
    value: `8`,
  },
  {
    name: "Ссылка на заголовок 'Author'",
    value: `9`,
  },
  {
    name: "Ссылка на изображение картинки для заголовка 'Author'",
    value: `10`,
  },
  {
    name: "Ссылка в название",
    value: `11`,
  },
];
module.exports = {
  name: "embsetup", // название команды
  descr: "Настройка эмбеда", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: "тип",
      description: "Параметр который Вы хотите изменить",
      type: ApplicationCommandOptionType.String,
      choices, // аргументы
      required: true,
    },
    {
      name: "значение",
      description: "Значение к аргументу который Вы выбрали",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  perms: (rolesId) => getAllRolesIdInfoMakers(rolesId), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, channelsId, args, guild, channel, author }) => {
    if (channel.id !== channelsId.infomakers) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Данную команду можно использовать только в канале <#${channelsId.infomakers}>**`
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
    const actionNum = Number(args[0]); // номер действия.
    const value = args[1];
    if (actionNum > choices.length + 1) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${leaderFam} уже является лидером или заместителем семьи \`${familyName}\`**`
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

    const embed =
      (await InfomakerEmbed.findOne({
        infoMakerId: author.id,
        guildId: guild.id,
      })) ||
      new InfomakerEmbed({
        infoMakerId: author.id,
        guildId: guild.id,
        title: "-",
        description: "-",
        color: "#FFFFFF",
        timestamp: "-",
        imageUrl: "-",
        footer: "-",
        imageFooter: "-",
        authorName: "-",
        authorLink: "-",
        authorImageLink: "-",
        urlTitle: "-",
        fields: [],
      });
    if (
      !(await InfomakerEmbed.findOne({
        infoMakerId: author.id,
        guildId: guild.id,
      }))
    ) {
      await embed.save();
    }

    if (+actionNum === 1) {
      if (value.length > 256) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            await new EmbedBuilder()
                .setTitle(`❌ | Ошибка!`)
                .setDescription(`**Вы указали более 256 символов для заголовка**`)
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

      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          title: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение заголовка`)
            .setDescription(`**Вы успешно изменили заголовок на \`${value}\`**`)
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

    if (+actionNum === 2) {
      if (value.length > 4096) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Вы указали более 4096 символов для описания**`)
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

      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          description: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение описание`)
            .setDescription(`**Вы успешно изменили описание на \`${value}\`**`)
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

    if (+actionNum === 3) {
      if (!value.startsWith("#")) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Цвет должен начинатся с #. Пример: #FFF**`)
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

      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          color: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение цвета`)
            .setDescription(`**Вы успешно изменили цвет на \`${value}\`**`)
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

    if (+actionNum === 4) {
      if (value != "включено" && value != "-") {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Невалидное значение. Используйте \`включено\` или \`-\`**`
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

      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          timestamp: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение даты`)
            .setDescription(`**Вы успешно включили/выключили показ даты**`)
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
    if (+actionNum === 5) {
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          imageUrl: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение картинки`)
            .setDescription(`**Вы успешно изменили URL картинки на \`${value}\`**`)
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
    if (+actionNum === 6) {
      if (value.length > 2048) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Вы указали более 2048 символов для подписи**`)
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
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          footer: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение подписи`)
            .setDescription(`**Вы успешно изменили подпись на \`${value}\`**`)
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
    if (+actionNum === 7) {
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          imageFooter: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение подписи`)
            .setDescription(
              `**Вы успешно изменили URL картинки автора подписи на \`${value}\`**`
            )
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
    if (+actionNum === 8) {
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          authorName: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение заголовка 'Author'`)
            .setDescription(
              `**Вы успешно изменили заголовок 'Author' на \`${value}\`**`
            )
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
    if (+actionNum === 9) {
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          authorImageLink: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение заголовка 'Author'`)
            .setDescription(
              `**Вы успешно изменили URL изображение заголовки 'Author' на \`${value}\`**`
            )
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
    if (+actionNum === 10) {
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          authorImageLink: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение URL изображение заголовка 'Author'`)
            .setDescription(
              `**Вы успешно изменили URL изображение заголовки 'Author' на \`${value}\`**`
            )
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
    if (+actionNum === 11) {
      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          urlTitle: value,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Изменение ссылки в заголовке`)
            .setDescription(
              `**Вы успешно изменили ссылку в заголовке на \`${value}\`**`
            )
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
  },
};
