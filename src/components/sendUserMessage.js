const settings = require('../configs/settings')

/*
      Функция отправки сообщения пользователям в лс.
        Делается отправка через функцию потому, что во многих случаях у людей бывают закрыты лс
        и нужно сообщение до них как-то донести, и поэтому есть канал #уведомления, туда скидываются
        подобные уведомления которые не дошли до людей в лс, и удобнее всего это делать через
        функцию.
    */

const sendUserMessage = async (message, userId, guild) => {
  const member = guild.members.cache.get(userId)
  if (!member) {
    return null
  }
  const embeds = message.embeds || []
  const components = message.components || []
  try {
    return await member.send({
      content: message.content,
      embeds,
      components
    })
  } catch (e) {
    const notificationsChannel =
      guild.channels.cache.get(settings.channelsId[guild.id].notifications) ||
      (
        await guild.channels.fetch(settings.channelsId[guild.id].notifications)
      )
    
    return notificationsChannel.send({
      content: `${member} ${message.content ? message.content : ''}`,
      embeds,
      components
    })
  }
}

module.exports = sendUserMessage
