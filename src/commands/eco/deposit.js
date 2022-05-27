const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require('discord.js')
const getCoinsProfile = require('../../components/getCoinsProfile')
const setUserCoinsParam = require('../../components/setUserCoinsParam')
const {
  coinsRates: { commissionPercent, limitDeposit, minSumForRefillDeposit, maxSumForRefillDeposit }
} = require('../../configs/settings')
const getDaysFromFirstDateToTwoDate = require('../../components/getDaysFromFirstDateToTwoDate')

const putDeposit = async ({ bot, user, interaction, sum, profile, guild, channelsId }) => {
  if (profile.lastDateDayRefillDeposit && getDaysFromFirstDateToTwoDate(new Date(profile.lastDateDayRefillDeposit) || 0, new Date()) < 0.5) {
    const dateEnd = new Date(profile.lastDateDayRefillDeposit)
    dateEnd.setHours(dateEnd.getHours() + 12)
    const minutes = Math.round((
      dateEnd - new Date()
    ) / 60000)

    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**Вы уже пополняли депозит за последние 12 часов!\nПополнить снова Вы сможете через: \`${minutes}\` минут!**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }

  if (sum < minSumForRefillDeposit || sum > maxSumForRefillDeposit) {
    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**Не корректная сумма! Минимальная сумма для пополнения - \`${minSumForRefillDeposit}\`. Максимальная сумма для пополнения - \`${maxSumForRefillDeposit}\`**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }
  if (profile.depositCoins >= limitDeposit) {
    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**На Вашем депозите достигнута максимальная сумма - \`${new Intl.NumberFormat('en-US').format(limitDeposit)}\`!**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }

  if ((
    profile.depositCoins + sum
  ) >= limitDeposit)
  {
    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**Данное пополнение депозита приведёт к превышению доступного лимита - \`${new Intl.NumberFormat('en-US').format(limitDeposit)}\`!**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }

  if (profile.coins < sum) {
    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**У Вас недостаточно средств для пополнения депозита на сумму - \`${sum}\`!**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }

  // Комиссия при закидывании денег на депозит.
  const commission = (
    sum / 100
  ) * commissionPercent

  const resultSum = sum - commission

  // Устанавливаем сумму на депозите.
  await setUserCoinsParam(user.id, guild.id, 'depositCoins', ({ depositCoins }) => {
    return (
      resultSum + depositCoins
    ).toFixed(4)
  })

  // Устанавливаем сумму на счёте.
  await setUserCoinsParam(user.id, guild.id, 'coins', ({ coins }) => {
    return coins - resultSum.toFixed(4)
  })

  // Устанавливаем дату последнего пополнения депозита.
  await setUserCoinsParam(user.id, guild.id, 'lastDateDayRefillDeposit', () => new Date())

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`💰 | Пополнение депозита!`)
        .setColor(Colors.Blue)
        .setDescription(`**Вы успешно пополнили депозит на \`${resultSum.toFixed(4)}!\`\n\`${commissionPercent}%\` было снято комиссией от общей суммы!**`)
        .setAuthor({
          name: guild.name, iconURL: guild.iconURL()
        })
        .setFooter({
          text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
        })
    ]
  })

  // Логируем процесс пополнения депозита в канал лог-surprisecoins
  const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins)
  const date = new Date()
  logCoinsChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`💰 | Пополнение депозита!`)
        .setColor(Colors.Blue)
        .setDescription(`**Пополнил: <@${user.id}>(${user.id})\nСумма: \`${sum.toFixed(4)}\`$\nКомиссия: \`${commission.toFixed(4)}(${commissionPercent}%)\`**`)
        .setAuthor({
          name: guild.name, iconURL: guild.iconURL()
        })
        .addFields([
          {
            name: `Остаток до пополнения`, value: `\`${profile.depositCoins}\``
          }, {
            name: `Остаток после пополнения`,
            value: `\`${(
              resultSum + profile.depositCoins
            ).toFixed(4)}\``
          }, {
            name: `Время`,
            value: `\`${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} \``,
            inline: true
          }
        ])
        .setFooter({
          text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
        })
    ]
  })
}

const withdrawMoney = async ({ bot, user, interaction, sum, profile, guild, channelsId }) => {
  const validValues = [25, 100]
  if (!validValues.includes(sum)) {
    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**Указано неправильно значение суммы которую Вы хотите снять!\nМожно снять либо 25% за один день, либо, 100% за неделю.**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }

  switch (sum) {
    case 25:
    {
      if (profile.lastDateDayDepositInteraction && getDaysFromFirstDateToTwoDate(new Date(profile.lastDateDayDepositInteraction) || 0, new Date()) < 1) {
        const dateEnd = new Date(profile.lastDateDayDepositInteraction)
        dateEnd.setHours(dateEnd.getHours() + 24)
        const minutes = Math.round((
          dateEnd - new Date()
        ) / 60000)
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Вы уже снимали сегодня деньги с депозита!\nВы сможете снять снова через \`${minutes}\` минут!**`)
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name, iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
      break
    }
    case 100:
    {
      if (profile.lastDateWeekDepositInteraction && getDaysFromFirstDateToTwoDate(new Date(profile.lastDateWeekDepositInteraction) || 0, new Date()) < 7) {
        const dateEnd = new Date(profile.lastDateDayDepositInteraction)
        dateEnd.setDate(dateEnd.getDate() + 7)
        const minutes = Math.round((
          dateEnd - new Date()
        ) / 60000)
        return interaction.reply({
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Вы уже снимали на этой неделе полную сумму!\nВы сможете снять снова через \`${minutes}\` минут!**`)
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name, iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }

      break
    }
  }

  const money = (
    profile.depositCoins / 100
  ) * (
    sum === 100 ? 100 : 25
  )

  // Комиссия при снятиях денег с депозита.
  const commission = (
    money / 100
  ) * commissionPercent

  // Сумма для вывода с депозита.
  const moneyForOutPut = money - commission

  if (profile.depositCoins < money) {
    return interaction.reply({
      embeds: [
        await new EmbedBuilder()
          .setTitle(`❌ | Ошибка!`)
          .setDescription(`**У Вас недостаточно средств для снятия с депозита \`${sum}\` монет!**`)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }

  await setUserCoinsParam(user.id, guild.id, 'depositCoins', ({ depositCoins }) => {
    return (
      depositCoins - money
    ).toFixed(4)
  })

  await setUserCoinsParam(user.id, guild.id, 'coins', ({ coins }) => {
    return (
      moneyForOutPut + coins
    ).toFixed(4)
  })

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`💰 | Снятие денег с депозита!`)
        .setColor(Colors.Blue)
        .setDescription(`**Вы успешно сняли с депозита сумму \`${moneyForOutPut.toFixed(4)}!\`\n\`${commissionPercent}%\` было снято комиссией от общей суммы!**`)
        .setAuthor({
          name: guild.name, iconURL: guild.iconURL()
        })
        .setFooter({
          text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
        })
    ]
  })

  // Логируем процесс пополнения депозита в канал лог-surprisecoins
  const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins)
  const date = new Date()
  logCoinsChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`💰 | Снятие с депозита!`)
        .setColor(Colors.Blue)
        .setDescription(`**Снял: <@${user.id}>(${user.id})\nСумма: \`${money.toFixed(4)}\`$\nКомиссия: \`${commission.toFixed(4)}(${commissionPercent}%)\`**`)
        .setAuthor({
          name: guild.name, iconURL: guild.iconURL()
        })
        .addFields([
          {
            name: `Остаток до пополнения`, value: `\`${profile.depositCoins}\``
          }, {
            name: `Остаток после пополнения`,
            value: `\`${(
              moneyForOutPut - profile.depositCoins
            ).toFixed(4)}\``
          }, {
            name: `Время`,
            value: `\`${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} \``,
            inline: true
          }
        ])
        .setFooter({
          text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
        })
    ]
  })

  switch (sum) {
    case 25:
    {
      await setUserCoinsParam(user.id, guild.id, 'lastDateDayDepositInteraction', new Date())
      break
    }
    case 100:
    {
      await setUserCoinsParam(user.id, guild.id, 'lastDateWeekDepositInteraction', new Date())
      break
    }
  }
}

module.exports = {
  name: 'deposit', // название команды
  descr: 'Взаимодействие с депозитом', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'действие',
      description: 'Действие которое Вы хотите произвести по отношению к депозиту',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Положить деньги(Значение указывается в числах)', value: 'putMoney'
        }, {
          name: 'Снять деньги(Значение указывается в процентах)', value: `withdrawMoney`
        }
      ],
      required: true
    }, {
      name: 'количество',
      description: `Количество или процент монет с которыми Вы производите взаимодействие`,
      type: ApplicationCommandOptionType.Number,
      required: true
    }
  ], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
    if (channel.id !== channelsId.coins) {
      return interaction.reply({
        ephemeral: true, embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Данная команда доступна только в канале <#${channelsId.coins}>!**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    const profile = await getCoinsProfile(author.id, guild.id)

    if (!profile.isDepositActive) {
      return interaction.reply({
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**У Вас неактивна возможность использовать депозит!\nДля активации депозита введите команду \`/active-deposit\`!**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    const action = args[0]
    const sum = Number(args[1])

    switch (action) {
      case 'putMoney':
      {
        await putDeposit({
          interaction, bot, guild, sum, profile, user: author, channelsId
        })
        break
      }
      case 'withdrawMoney':
      {
        await withdrawMoney({
          interaction, bot, guild, sum, profile, user: author, channelsId
        })
        break
      }
    }
  }
}
