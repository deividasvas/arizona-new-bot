const setUserCoinsParam = require('../components/setUserCoinsParam')
const convertMinutesToMs = require('../components/convertMinutesToMs')
const CoinsUsers = require('../models/CoinsUsers')
const { getGuildChannelsId, getGuildRolesId, coinsRates: { rolesDepositCoefficient } } = require('../configs/settings')
const { EmbedBuilder, Colors } = require('discord.js')
const fs = require('fs')
const path = require('path')

// Путь до файла coins.json. Начинается от корневого файла.
const pathToConfig = path.resolve('./configs/coins.json');

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы обрабатывать магазин койнов и для того, чтобы выдавать койны за сообщения.
  */
  autoRun: true, // автоматический запуск модуля
  name: 'coins', // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  usersInVoice: [], // пользователи которые находятся в голосовых каналах
  initial: false, // если не разу не запускался метод init, то inited - false
  isValidChannelForGiveXp (channel) {
    // Если количество пользователей в канале один или меньше, то это не валидный канал.
    if (channel.members.size <= 1) {
      return false
    }
    // Функция для проверки являются ли все пользователи в канале замучеными
    const getAllMutedUsersInVoice = () => {
      const mutes = []
      for (const [userId, member] of channel.members) {
        const { voice } = member
        if (voice.selfDeaf || voice.selfMute || voice.serverDeaf || voice.serverMute) {
          mutes.push(member)
        }
      }
      return mutes
    }
    const allMutedUsersInVoiceMembers = getAllMutedUsersInVoice()
    if (allMutedUsersInVoiceMembers.length === channel.members.size || allMutedUsersInVoiceMembers.length === channel.members.size - 1) {
      return false
    }
    return true
  },

  async restartPays (bot) {
    // Обнуляем всем пользователям количество переданных монет.
    await CoinsUsers.updateMany({}, {
      paidOfDay: 0
    })
    for (const [id, guild] of bot.guilds.cache) {
      const date = new Date()
      const { logCoins } = getGuildChannelsId(id);
      const logCoinsChannel = guild.channels.cache.get(logCoins)
      logCoinsChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Перезагрузка переводов!`)
            .setDescription(`**Дневные ограничения на перевод были убраны!**`)
            .setColor(Colors.Blue)
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .addFields([
              {
                name: `Время`,
                value: `${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}`
              }
            ])
        ]
      })
    }
  },

  async restartDeposits (bot) {
    // Перебираем все сервера
    for (const [guildId, guild] of bot.guilds.cache) {
      const rolesId = getGuildRolesId(guildId);
      const channelsId = getGuildChannelsId(guildId);
      // Получаем все роли на данном сервере у которых есть коэффициент
      const rolesIdDepositCoefficient = await rolesDepositCoefficient(rolesId)
      // Получаем всех пользователей на данном сервере у которых активен депозит.
      const allUsersWithActiveDeposit = await CoinsUsers.find({
        guildId, isDepositActive: true
      })

      for (const user of allUsersWithActiveDeposit) {
        const member = guild.members.cache.get(user.userId)
        if (!member) {
          continue
        }

        // Роли которые есть у пользователя и которая входит в число ролей с коэффициентом
        const rolesWithCoefficientMember = member.roles.cache.filter(role => {
          return rolesIdDepositCoefficient.find(([coefficientRoleId, coefficient]) => role.id === coefficientRoleId)
        })

        // Наивысшая роль, которая есть у пользователя и у которой наивысший коэффициент.
        const headRole = rolesWithCoefficientMember.mapValues(el => el).reduce((total, current) => {
          if (total[1] < current[1]) {
            return current
          }
          return total
        })

        // Если наивысшей роли нет, то никакого процента человеку к депозиту не даём.
        if (!headRole) {
          continue
        }

        // Коэффициент наивысшей роли
        const roleCoefficient = (
          rolesIdDepositCoefficient.find(([coefficientRoleId, coefficient]) => coefficientRoleId === headRole.id)
        )[1]

        // Устанавливаем пользователю новый депозит.
        await setUserCoinsParam(user.userId, guild.id, 'depositCoins', ({ depositCoins }) => {
          return depositCoins + (
            (
              depositCoins / 100
            ) * roleCoefficient
          )
        })
      }

      const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins)
      const date = new Date()
      logCoinsChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Перезагрузка депозитов!`)
            .setDescription(`**Депозит был обновлен!!**`)
            .setColor(Colors.Green)
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .addFields([
              {
                name: `Время`,
                value: `${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}`
              }
            ])
        ]
      })
    }
  },
  init ({ bot }) {
    setInterval(async () => {
      for (const [id, guild] of bot.guilds.cache) {
        for (const [userId, member] of guild.members.cache) {
          if (!member.voice?.channel) {
            continue
          }
          const { channel } = member.voice
          if (!this.isValidChannelForGiveXp(channel)) {
            continue
          }
          await setUserCoinsParam(userId, guild.id, 'coins', ({ coins, rates, coefficient }) => {
            return (
              coins + rates.voice * coefficient
            ).toFixed(4)
          })
        }
      }
    }, convertMinutesToMs(1))
    setInterval(async () => {
      // Базовые настройки с датами обновления данных.
      const coinsSettings = require(pathToConfig)
      const {
        lastDateRestartCoins: _lastDateRestartCoins, lastDateUpdateDeposit: _lastDateUpdateDeposit
      } = coinsSettings
      // Последняя дата перезапуска переведенных монет за день.
      const lastDateRestartPaysCoins = new Date(_lastDateRestartCoins)
      const date = new Date()
      // Если день последнего обновления переведенных монет за день не совпадает с текущим днём, то перезапускаем платежи.
      if (date.getDate() !== lastDateRestartPaysCoins.getDate()) {
        // Перезапускаем платежи.
        await this.restartPays(bot)
        // Обновляем данные в конфиге чтобы потом всё нормально работало.
        await fs.writeFileSync(path.resolve(pathToConfig), JSON.stringify({
          ...coinsSettings,
          lastDateRestartCoins: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        }))
        // Удаляем из кэша файл с койнами чтобы при новом require была актуальная дата обновления.
        delete require.cache[pathToConfig]
      }

      // Последняя дата обновления депозита.
      const lastDateUpdateDeposit = new Date(_lastDateUpdateDeposit)
      // Часы на данный момент.
      const actualDateHours = date.getHours()
      // Если часы сейчас это 0 или 12, и при этом, в этот час не обновлялся уже депозит, то обновляем его.
      if (
        (
          actualDateHours === 0 || actualDateHours === 12
        ) && actualDateHours !== lastDateUpdateDeposit.getHours()
      )
      {
        // Перезапускаем депозит.
        await this.restartDeposits(bot)
        // Редактируем конфиг.
        await fs.writeFileSync(path.resolve(pathToConfig), JSON.stringify({
          ...coinsSettings,
          lastDateUpdateDeposit: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        }))
      }

    }, convertMinutesToMs(1))
    this.initial = true
  },

  async run ({ bot, message, interaction }) {
    if (!this.initial) {
      this.init({ bot })
    }
    const member = message?.author || interaction?.member
    const guild = message?.guild || bot.guilds.cache.get(interaction?.guildId)
    // Если при запуске модуля передаётся туда сообщение, то вызвано оно из messageCreate. Соответственно,
    // нужно выдать койны за сообщение.
    if (message) {
      return await setUserCoinsParam(member.id, guild.id, 'coins', ({ coins, coefficient, rates, platforms }) => {
        const num = (
          coins + rates.message + (
            (
              (
                rates.message * platforms
              ) || 0
            )
          )
        ) * coefficient

        return num.toFixed(4)
      })
    }
  }
}