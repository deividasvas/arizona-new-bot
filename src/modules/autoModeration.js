const { getGuildChannelsId } = require('../configs/settings')
const getAutoModerationConfig = require('../components/getAutoModerationConfig')
const { EmbedBuilder, Colors } = require('discord.js')

function checkCaps (text) {
  let res = text.replace(/[ ]/g, '')
  let lengthText = res.length
  if (lengthText <= 10) {
    return 0
  }
  let textCaps = text.match(/[A-ZА-ЯЁ]/g)
  if (textCaps) {
    let coefficient = 100 * (
      textCaps.length / lengthText
    )
    return coefficient
  } else {
    return 0
  }
}

function sendLogs (name, user, message, originalMessage, channel, image) {
  const embed = new EmbedBuilder()
  const date = new Date()

  embed.setTitle(name)
  embed.setDescription('**\`Доказательства:\`**\n' + message)
  embed.setColor(Colors.Blue)
  embed.setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
  embed.addFields([
    {
      name: `\`Пользователь:\``, value: `<@${user.id}>`
    }, {
      name: `\`ID:\``, value: `\`${user.id}\``
    }, {
      name: `\`Канал:\``, value: `<#${originalMessage.channel.id}>`
    }, {
      name: `\`Дата и время нарушения:\``,
      value: `\`${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} \``
    }
  ])
  embed.setImage(image)
  embed.setFooter({
    text: 'Система автомодерации | Robo Hamster',
    iconURL: channel.guild.iconURL({ format: 'png', size: 2048, dynamic: true })
  })

  return channel.send({ embeds: [embed] })
}

const blacklistSpam = {}
const previousMsg = {}
const previousLink = {}

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы если новичок или кто-то ещё написал слово роль или дайте роль в общий чат
    то ему бот автоматически ответил что ему следует делать.
  */
  name: 'autoModeration', // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  autoRun: false, // автоматический запуск модуля
  run: async ({ bot, message }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
    const { guild } = message
    const {
      ignoredChannelsId,
      ignoredCategoriesId,
      allowedRolesId,
      cooldownLinks,
      whiteListLinks,
      allBadWords,
      maxMentions,
      maxEmojis,
      cooldownDuplicate,
      cooldownMessage,
      maxMat
    } = getAutoModerationConfig()
    const channelsId = getGuildChannelsId(guild.id);
    const autoModerationLogChannel = guild.channels.cache.get(channelsId.autoModeration)

    if (ignoredChannelsId.includes(message.channel.id)) {
      return null
    }
    if (ignoredCategoriesId.includes(message.channel.parentId)) {
      return null
    }
    if (message.author.bot) {
      return null
    }
    if (message.member.roles.cache.some(role => allowedRolesId.includes(role.id))) {
      return null
    }
    if (message.member.permissions.has('Administrator')) {
      return null
    }

    // Проверка на запрещенную ссылку внутри контента сообщения.
    const regexLink = /(((https?:\/\/)|(www\.))[^\s]+)/g
    const messageInLink = message.content.match(regexLink)
    if (messageInLink) {
      const fullUrlLink = new URL(messageInLink)
      if (!whiteListLinks.some(link => fullUrlLink.hostname === link)) {
        if (previousLink[message.author.id]) {
          if (previousLink[message.author.id].count >= 1) {
            delete previousLink[message.author.id]
            sendLogs('Запрещённые ссылки', message.author, message.content, message, autoModerationLogChannel, null)
            return message.delete()
          } else {
            previousLink[message.author.id].count++
          }
        } else {
          previousLink[message.author.id] = {}
          previousLink[message.author.id].count = 1
          setTimeout(function () {
            delete previousLink[message.author.id]
          }, cooldownLinks)
          sendLogs('Запрещённые ссылки', message.author, message.content, message, autoModerationLogChannel, null)
          return message.delete()
        }
      }
    }

    // Проверка на запрещённые слова внутри контента сообщения.
    // Переданный в matchAll массив преобразуется в регулярное выражение которое находит все маты, затем, просто прокидываем
    // под методом .map, чтобы взять нужные нам данные.
    const blackWordsInMessage = (
      [...message.content.matchAll(allBadWords.join('|'))]
    )
      .map((matchElement) => matchElement[0])

    // Если количество матов ровняется или больше допустимого, то кидаем в логи.
    if (blackWordsInMessage.length >= maxMat) {
      sendLogs(`Количество матов более ${maxMat}`, message.author, message.content, message, autoModerationLogChannel, null)
      return message.delete()
    }

    // Проверка на массовые упоминания внутри сообщения.
    const countMentions = message.content.split(/<@(.*?)>/).filter(function (e) { return e.trim().length > 0 }).length
    if (countMentions >= maxMentions) {
      sendLogs('Массовое упоминание', message.author, message.content, message, autoModerationLogChannel, null)
      return message.delete()
    }

    // Проверка на массовое количество эмодзи в сообщении.
    const emojisCountInMessage = message.content.match(/\p{Emoji_Presentation}/gu)
    const customEmoji = message.content.match(/<:(.*?)>/gu)
    let countEmoji = 0
    let numberCustomEmoji = 0

    if (emojisCountInMessage !== null) {
      countEmoji = customEmoji?.length
    }
    if (customEmoji !== null) {
      numberCustomEmoji = customEmoji.length
    }

    const resultSumEmoji = countEmoji + numberCustomEmoji

    if (resultSumEmoji > maxEmojis) {
      sendLogs('Чрезмерное большое количество смайликов в сообщении ', message.author, message.content, message, autoModerationLogChannel, null)
      return message.delete()
    }

    // Проверка на капс в сообщении.
    const capsCoefficient = checkCaps(message.content)
    if (capsCoefficient !== 0) {
      if (capsCoefficient >= capsCoefficient) {
        sendLogs('Капс', message.author, message.content, message, autoModerationLogChannel, null)
        return message.delete()
      }
    }

    // Проверка на дублирование сообщения
    if (!(
      message.content.startsWith('/') || message.content.startsWith('ms!')
    ))
    {
      if (previousMsg[message.author.id]) {
        if (previousMsg[message.author.id].count >= 2) {
          sendLogs('Дублирование сообщений', message.author, `**Первое сообщение [\`${previousMsg[message.author.id].time[0]}\`]:** ${previousMsg[message.author.id].msg[0]}\n**Второе сообщение [\`${new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}\`]:** ${message.content}`, message, autoModerationLogChannel, null)
          delete previousMsg[message.author.id]
          return// Здесь должно быть  message.delete()
        } else if (previousMsg[message.author.id].previousMsg === message.content) {
          previousMsg[message.author.id].count++
          previousMsg[message.author.id].msg.push(message.content)
          previousMsg[message.author.id].time.push(new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' }))
          return message.delete()
        } else {
          previousMsg[message.author.id].previousMsg = message.content
        }
      } else {
        previousMsg[message.author.id] = {}
        previousMsg[message.author.id].msg = []
        previousMsg[message.author.id].time = []
        previousMsg[message.author.id].previous_msg = message.content
        previousMsg[message.author.id].msg.push(message.content)
        previousMsg[message.author.id].time.push(new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' }))
        previousMsg[message.author.id].count = 1
        setTimeout(function () {
          delete previousMsg[message.author.id]
        }, cooldownDuplicate)
      }
    }

    // Проверка на спам.
    const numberMsg = 5
    if (!message.author.bot) {
      if (blacklistSpam[message.author.id]) {
        blacklistSpam[message.author.id].count++
        blacklistSpam[message.author.id].msgCache.push(message.content)
        if (blacklistSpam[message.author.id].count >= numberMsg) {
          const prooves = `\n**Первое сообщение:** ${blacklistSpam[message.author.id].msgCache[0]}\n**Второе сообщение:** ${blacklistSpam[message.author.id].msgCache[1]}\n**Третье сообщение:** ${blacklistSpam[message.author.id].msgCache[2]}\n**Четвёртое сообщение:** ${blacklistSpam[message.author.id].msgCache[3]}\n**Пятое сообщение:** ${blacklistSpam[message.author.id].msgCache[4]}\n`
          sendLogs('Спам сообщениями', message.author, prooves, message, autoModerationLogChannel, null)
        }
      } else {
        blacklistSpam[message.author.id] = {}
        blacklistSpam[message.author.id].count = 1
        blacklistSpam[message.author.id].msgCache = []
        blacklistSpam[message.author.id].msgCache.push(message.content)
        setTimeout(function () {
          delete blacklistSpam[message.author.id]
        }, cooldownMessage)
      }
    }
  }
}
