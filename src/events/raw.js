const getAllRolesIdModers = require('../components/getAllRolesIdModers')
const { rolesId: _rolesId, channelsId: _channelsId } = require('../configs/settings')
const { EmbedBuilder, Colors } = require('discord.js')

// Функция, которая превращает сообщение в чанк по 1000 символов в каждом.
function chunkify (toChunk) {
  const lenChunks = Math.ceil(toChunk.length / 1000)
  const chunksToReturn = []
  for (let i = 0; i < lenChunks; i++) {
    const chunkedStr = toChunk.substring((
      1000 * i
    ), i === 0 ? 1000 : 1000 * (
      i + 1
    ))
    chunksToReturn.push(chunkedStr)
  }
  return chunksToReturn
}

module.exports = async (bot, raw) => {
  // Принимаемые типы. Пишется в стиле discord.js v12
  const type = raw.t
  const acceptTypes = [
    'MESSAGE_REACTION_ADD'
  ]
  if (!acceptTypes.includes(type)) {
    return
  }

  const { guild_id: guildId, emoji, channel_id: channelId, message_id: messageId } = raw.d
  const rolesId = _rolesId[guildId]
  const channelsId = _channelsId[guildId]

  // Сервер на котором происходит действие.
  const guild = bot.guilds.cache.get(guildId)
  // Пользователь сам. (Беру через .cache.get потому, что, из raw передается самый обычный объект с апишкой от самого дискорда)
  const member = guild.members.cache.get(raw.d.member.user.id)
  // Канал в котором произошло действие
  const channel = guild.channels.cache.find(channel => channel.id === channelId)
  // Сообщение на котором произошло взаимодействие.
  const message = await channel.messages.fetch(messageId)
  // Роли которым можно удалять сообщения реакцией wrench
  const rolesAllowDeleteMessageWithReaction = [
    ...getAllRolesIdModers(rolesId)
  ]
  // Канал куда будет отправляться эмбед
  const logChannel = guild.channels.cache.get(channelsId.messagesDelete)

  // Если пользователь не имеет админки в дискорде или у него нет ролей модератора или он бот, то ничего не делаем.
  if (member.user.bot || !member.roles.cache.some(roleId => rolesAllowDeleteMessageWithReaction.includes(roleId)) && !member.permissions.has('Administrator')) {
    return null
  }

  // Если автор сообщения бот, то ничего не делаем
  if(message.author.bot){
    return null;
  }

  // Эмбед который будет отправлен в итоге в лог.
  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle(`📌 | Удаления сообщения`)
    .addFields([
      {
        name: `Модератор`,
        value: `<@${member.id}> (${member.id})`,
      },
      {
        name: `Автор сообщения`,
        value: `<@${message.author.id}> (${message.author.id})`,
      },
      {
        name: `Канал сообщения`,
        value: `<#${channel.id}> (${channel.id})`,
      }
    ])

  if (emoji.name === '🔧') {
    let messageChunks = []

    if (message.content) {
      if (message.content.length > 1000) {
        messageChunks = chunkify(message.content.replace(/\"/g, '"').replace(/`/g, ''))
      } else {
        messageChunks.push(message.content)
      }
    }

    messageChunks.forEach((chunk, i) => {
      embed.addFields([
        {
          name: i === 0 ? 'Контент' : `Продолжение`,
          value: `${chunk || 'Отсутствует'}`,
          inline: false
        }
      ])
    })
    let images = []
    if (message.attachments.size !== 0) {
      message.attachments.forEach((attachment) => {
        images.push(attachment)
      })
      embed.addFields([
        {
          name: `Ссылки на изображение`,
          value: images.map(message => message.proxyURL).join('\n')
        }
      ])
      embed.setImage(images[0].proxyURL)
    }
    let stickers = []
    if (message.stickers.size !== 0) {
      message.stickers.forEach((sticker) => {
        stickers.push(sticker)
      })
      embed.addFields([
        {
          name: `Ссылка на стикер`,
          value: stickers.map(m => m.url).join('\n')
        }
      ])
    }
    await message.delete()
    logChannel.send({
      embeds: [
        embed
      ]
    })
  }
}