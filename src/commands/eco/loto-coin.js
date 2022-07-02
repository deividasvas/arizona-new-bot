const { EmbedBuilder, ApplicationCommandOptionType, Colors, Collection } = require('discord.js')
const randomItem = require('random-item-percent')
const {
  coinsRates: {
    commissionPercent,
    minSumForGameLoto,
    maxSumForGameLoto,
    prizesPercentageLoto
  }
} = require('../../configs/settings')
const path = require('path')
const fs = require('fs')
const setUserCoinsParam = require('../../components/setUserCoinsParam')
const convertMinutesToMs = require('../../components/convertMinutesToMs')
// Путь идёт от файла index.js
const pathToConfig = path.join(__dirname, '../../configs/coins.json')

// Функция для установки баланса фонда. Передаётся функция внутрь которой в будущем передают текущий фонд параметром balance.
const setFundBalance = (func) => {
  const coinsSettings = require(pathToConfig)

  fs.writeFileSync(pathToConfig, JSON.stringify({
    ...coinsSettings,
    fundBalance: func(coinsSettings.fundBalance)
  }))
}

// Коллекция с пользователями у которых КД.
const cooldownUsers = new Collection();

// КД в минутах.
const cooldownMinutes = 5;
setInterval(() => {
  for (const [userId, dateStart] of cooldownUsers) {
    const dateEnd = new Date(dateStart).setMinutes(dateStart.getMinutes() + cooldownMinutes)
    if ((
      dateEnd - new Date() / convertMinutesToMs(1)
    ) < cooldownMinutes)
    {
      cooldownUsers.delete(userId)
    }
  }
}, 5000)

module.exports = {
  name: 'loto-coin', // название команды
  descr: 'Сыграть в лотерею', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'ставка',
      description: `Ставка на которую Вы готовы сыграть(от ${minSumForGameLoto} до ${maxSumForGameLoto})`,
      type: ApplicationCommandOptionType.Number,
      required: true
    }
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
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    if (cooldownUsers.has(author.id)) {
      const dateEnd = new Date(cooldownUsers.get(author.id))
      dateEnd.setMinutes(dateEnd.getMinutes() + cooldownMinutes)
      const minutes = Math.round((
        dateEnd - new Date()
      ) / 60000)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`⏳ | Стой-стой!`)
            .setDescription(`**Полегче друг, у тебя действует интервал на лотерею. Ты сможешь вновь использовать лотерею через \`${minutes}\` минут(у)**`)
            .setColor(Colors.Blue)
            .setTimestamp()
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    // Удаляем кэш импорта настройки системы койнов чтобы можно было получить актуальные данные.
    delete require.cache[pathToConfig]

    const coinsSettings = require(pathToConfig)

    const sum = args[0]

    if (sum < minSumForGameLoto || sum > maxSumForGameLoto) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Некорректная сумма! Минимальная сумма - \`${minSumForGameLoto}\`. Максимальная сумма - \`${maxSumForGameLoto}\`**`
            )
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    cooldownUsers.set(author.id, new Date());

    const prize = randomItem({
      itemsList: prizesPercentageLoto.map(prizePercentage => (
        {
          itemEnum: prizePercentage.prize,
          percent: prizePercentage.percent
        }
      ))
    })

    if (prize.itemEnum === 'none') {
      setFundBalance((balance) => balance + sum)
      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => (
        coins - sum
      ).toFixed(4))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Лотерея!`)
            .setColor(Colors.Blue)
            .setDescription(`**К сожалению, Ваша сумма была проиграна!\nСумма \`${sum}\` была переведена на счёт фонда!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (prize.itemEnum === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Лотерея!`)
            .setColor(Colors.Blue)
            .setDescription(`**К сожалению, Вы ничего не выиграли, но, и ничего не потеряли!\nСумма \`${sum}\` остаётся при Вас!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (prize.itemEnum === 'x2') {
      setFundBalance((balance) => {
        if (balance - sum <= 0) {
          return 0
        }
        return balance - sum
      })
      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
        // Снимаем комиссию от суммы.
        const commissionSum = (
          (
            coins + (
              sum * 2
            )
          ) * 100
        ) / commissionPercent
        const resultSum = (
          coins + (
            sum * 2
          )
        ) - commissionSum
        return resultSum.toFixed(4)
      })
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Лотерея!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы выиграли умножение Вашей суммы в двоя!\nСумма \`${(
              sum * 2
            ).toFixed(4)}\` была переведена Вам на счёт!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (prize.itemEnum === 'x3') {
      setFundBalance((balance) => {
        if (balance - sum <= 0) {
          return 0
        }
        return balance - (
          sum * 2
        )
      })
      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
        const commissionSum = (
          (
            coins + (
              sum * 3
            )
          ) * 100
        ) / commissionPercent
        const resultSum = (
          coins + (
            sum * 3
          )
        ) - commissionSum
        return resultSum.toFixed(4)
      })
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Лотерея!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы выиграли умножение Вашей суммы в троя!\nСумма \`${(
              sum * 2
            ).toFixed(4)}\` была переведена Вам на счёт!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (prize.itemEnum === 'all') {
      setFundBalance(() => {
        return 0
      })
      await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
        return (
          coins + coinsSettings.fundBalance
        ).toFixed(4)
      })
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Джек пот!!`)
            .setColor(Colors.Blue)
            .setDescription(`**Вы выиграли сумму ВСЕГО фонда!\nСумма \`${coinsSettings.fundBalance.toFixed(4)}\` была переведена Вам на счёт!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
  }
}
