const { EmbedBuilder, ApplicationCommandOptionType, Colors, Embed } = require('discord.js');
const getCoinsProfile = require('../../components/getCoinsProfile');
const setUserCoinsParam = require('../../components/setUserCoinsParam');
const UserCoins = require('../../models/CoinsUsers');
const familyModel = require('../../models/Families');
const { coinsRates, maxCountPlatforms, rates } = require('../../configs/settings');
const isActiveNickCustomFont = require('../../components/isActiveSendEmojiAndStickersFromOtherServers');

module.exports = {
  name: 'buy', // название команды
  descr: 'Приобрести товар', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'товар',
      description: 'Товар который Вы хотите приобрести',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: `Платформа | ${coinsRates.startPlatformPrice} монет (изначальная цена)`,
          value: 'platform'
        },
        {
          name: `Нестандартный шрифт в нике | ${coinsRates.customFontPrice} монет`,
          value: `customFont`
        },
        {
          name: `Возможность отправлять эмодзи, стикеры в #welcome | ${coinsRates.customEmojiAndStickersPrice} монет (на месяц)`,
          value: `customEmojiAndStickers`
        },
        {
          name: `Уровни /rank | ${coinsRates.oneLevelRankPrice} монет за 1 уровень`,
          value: `oneLevelRank`
        },
        {
          name: `Surprise family pass | ${coinsRates.famPassMonthPrise} монет (в месяц)`,
          value: `famPass`
        },
        {
          name: `Surprise person Pass | ${coinsRates.userPassPrice.month} SC в месяц`,
          value: `userPass`
        }
      ],
      required: true
    },
    {
      name: `количество-уровней`,
      type: ApplicationCommandOptionType.Number,
      description: `Количество уровней которое Вы хотите себе приобрести | ${coinsRates.oneLevelRankPrice} монет за 1 уровень | Максимум 25 уровней`,
      required: false
    },
  ], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
    if (channel.id !== channelsId.coins) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Данная команда доступна только в канале <#${channelsId.coins}>!**`
            )
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    const type = args[0]
    const profile = await getCoinsProfile(author.id, guild.id)
    const leaderFam = await familyModel({
      ownerId: author.id
    });

    if (type === 'platform') {
      if (profile.platforms >= maxCountPlatforms) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Вы достигли максимального количества платформ - \`${profile.platforms}\`**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
      const platformPrice = coinsRates.startPlatformPrice + (
        coinsRates.platformCoefficient * profile.platforms
      )
      if (profile.coins < platformPrice) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У Вас недостаточно монет!\n Необходимо: \`${platformPrice}\`.\n У Вас есть: \`${profile.coins.toFixed(3)}\`**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
      await setUserCoinsParam(author.id, guild.id, 'platforms', ({ platforms }) => {
        return platforms + 1
      })

      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
        return (
          coins - platformPrice
        ).toFixed(4)
      })

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Успешная покупка!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы успешно приобрели одну платформу! Теперь у Вас \`${profile.platforms + 1}\` платформ!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (type === 'customFont') {
      if (profile.coins < coinsRates.customFontPrice) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У Вас недостаточно монет!\n Необходимо: \`${coinsRates.customFontPrice}\` монет.\n У Вас есть: \`${profile.coins.toFixed(3)}\` монет**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }

      await setUserCoinsParam(author.id, guild.id, 'isActiveCustomFontInNickname', true)
      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => coins - coinsRates.customFontPrice)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Успешная покупка!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы успешно приобрели возможность отправлять стикеры и эмодзи с других серверов!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (type === 'customEmojiAndStickers') {
      if(profile.sendEmojiAndStickersFromOtherServers){
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У Вас уже имеется возможность отправлять стикеры и эмодзи с других серверов!**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
      if (profile.coins < coinsRates.customEmojiAndStickersPrice) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У Вас недостаточно монет!\n Необходимо: \`${coinsRates.customEmojiAndStickersPrice}\` монет.\n У Вас есть: \`${profile.coins.toFixed(3)}\` монет**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }

      const dateEnd = new Date()
      dateEnd.setDate(dateEnd.getDate() + 30)
      await setUserCoinsParam(author.id, guild.id, 'sendEmojiAndStickersFromOtherServers', {
        dateEnd
      });
      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => coins - coinsRates.customEmojiAndStickersPrice)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Успешная покупка!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы успешно приобрели возможность использовать эмодзи и стикеры с других серверов! Через месяц нужно будет вновь купить данную возможность!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (type === 'oneLevelRank') {
      const adviceAdministrationChannel = guild.channels.cache.get(channelsId.administrationCouncil);
      // Количество уровней которое покупает пользователь.
      const countLevels = args[1]
      // Итоговая цена за это всё.
      const price = countLevels * coinsRates.oneLevelRankPrice
      if (countLevels === 0) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Минимальное можно приобрести один уровень!**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
      if (profile.coins < price) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У Вас недостаточно монет!\n Необходимо: \`${price}\` монет.\n У Вас есть: \`${profile.coins.toFixed(3)}\` монет**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
      adviceAdministrationChannel.send({
        content: `<@&${rolesId.adviceAdministration}> <@&${rolesId.juniorDiscordMaster}>`,
        embeds: [
          new EmbedBuilder()
            .setTitle(`📞 | Покупка уровней в /buy`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setDescription(`**Пользователь ${author} (${author.id}) приобрел \`${countLevels}\` уровней(ень) за \`${price.toFixed(3)}\` монет. Необходимо ему их выдать!!!**`)
        ]
      })

      await setUserCoinsParam(author.id, guild.id, `coins`, ({ coins }) => (
        coins - price
      ).toFixed(4));

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Успешная покупка!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы успешно приобрели \`${countLevels}\` уровней! Обратитесь в канал <#${channelsId.support}> для дальнейшей их выдачи.**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    if(type == 'famPass') {
      if(!leaderFam) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Купить данное улучшение может только лидер семьи!**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }

      if(profile.coins < coinsRates.famPassMonthPrise) {
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У вас недостаточно монет для покупки данной подписки!\n Необходимо: \`${coinsRates.famPassMonthPrise}\` монет.\n У Вас есть: \`${profile.coins.toFixed(3)}\` монет.**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }

      const dateEnd = new Date();
      dateEnd.setMonth(dateEnd.getMonth() + 1);

      await familyModel.findOneAndUpdate({
        ownerId: author.id
      }, {
        familyPass: {
          dateEnd,
        }
      })

      await setUserCoinsParam(author.id, guild.id, `coins`, ({ coins }) => (
        coins - coinsRates.famPassMonthPrise
      ).toFixed(4));

      interaction.reply({
        embeds: [
          await new EmbedBuilder()
          .setTitle(`💰 | Успешная покупка!`)
          .setColor(Colors.Blue)
          .setDescription(`**вы успешно приобрели подписку "Family Pass" сроком на 1 месяц!\nПосле покупки у вас осталось: ${profile.coins} монет!**`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL()
          })
        ]
      })
    }

    if(type == 'userPass') {
      const passType = args[2];

      if(passType == 'WeekPass') {
        if(profile.coins < coinsRates.userPassPrice.week) {
          return interaction.reply({
            embeds: [
              await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У вас недостаточно монет для покупки данной подписки!\n Необходимо: \`${coinsRates.userPassPrice.week}\` монет.\n У Вас есть: \`${profile.coins.toFixed(3)}\` монет.**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
            ]
          })
        }

        const dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDay() + 7);
  
        await setUserCoinsParam(author.id, guild.id, `coins`, ({ coins }) => (
          coins - coinsRates.userPassPrice.week
        ).toFixed(4));

        await UserCoins.findOneAndUpdate({
          userId: author.id
        }, {
          userPass: {
            dateEnd,
          }
        })

        await interaction.reply({
          embeds: [
            await new EmbedBuilder()
            .setTitle(`💰 | Успешная покупка!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы успешно приобрели подписку \`Surprise Pass\` на 1 неделю! Обратитесь в канал <#${channelsId.support}> для получения уровня.**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
          ]
        })
      }

      if(passType == 'MonthPass') {
        if(profile.coins < coinsRates.userPassPrice.month) {
          return interaction.reply({
            embeds: [
              await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**У вас недостаточно монет для покупки данной подписки!\n Необходимо: \`${coinsRates.userPassPrice.month}\` монет.\n У Вас есть: \`${profile.coins.toFixed(3)}\` монет.**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
            ]
          })
        }

        const dateEnd = new Date();
        dateEnd.setMonth(dateEnd.getMonth() + 1);
  
        await setUserCoinsParam(author.id, guild.id, `coins`, ({ coins }) => (
          coins - coinsRates.userPassPrice.month
        ).toFixed(4));

        await UserCoins.findOneAndUpdate({
          userId: author.id
        }, {
          userPass: {
            dateEnd,
          }
        })

        await interaction.reply({
          embeds: [
            await new EmbedBuilder()
            .setTitle(`💰 | Успешная покупка!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы успешно приобрели подписку \`Surprise Pass\` на 1 месяц! Обратитесь в канал <#${channelsId.support}> для получения уровня.**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
          ]
        })
      }
    }
  }
}
