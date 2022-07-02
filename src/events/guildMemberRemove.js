const { getGuildChannelsId } = require('../configs/settings')
const { EmbedBuilder, Colors } = require('discord.js')
module.exports = async (bot, member) => {
  const { guild } = member
  const channelsId = getGuildChannelsId(guild.id);
  const channelLog = guild.channels.cache.get(channelsId.joinsAndExits)

  const rolesList = []
  for (const role of member.roles.cache) {
    rolesList.push(role.id)
  }
  const logs = await member.guild.fetchAuditLogs({
    before: null,
    limit: 1,
    type: 20
  }).catch(() => { })

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setAuthor({
      name: guild.name, iconURL: guild.iconURL()
    })
    .setTimestamp()
    .setFooter({
      text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
    })
    .addFields([
      {
        name: `Информация о пользователе`,
        value: `${member.user.username}#${member.user.discriminator} (${member.id}) ${member}`
      },
      {
        name: `Присоединился`,
        value: `${member.joinedAt.toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
          hour12: false
        })} (${Math.abs((
          (
            new Date().getTime() - member.joinedAt
          ) / 1000 / 60 / 60 / 24
        )).toFixed(0)} дней назад)`
      },
      {
        name: `Создан аккаунт`,
        value: `${member.user.createdAt.toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
          hour12: false
        })} (${Math.abs((
          (
            new Date().getTime() - member.user.createdAt
          ) / 1000 / 60 / 60 / 24
        )).toFixed(0)} дней назад)`
      },
      {
        name: `Роли`,
        value: `${rolesList.join(', ') || "Отсутствовали"}`
      },
      {
        name: `Количество участников`,
        value: `${member.guild.memberCount}`
      }
    ])

  // Ниже идёт проверка того кикнули ли пользователя или он сам вышел.
  let log
  if (logs && logs.entries && logs.entries.size !== 0) {
    log = logs.entries.find(e => e.target.id === member.id)
  }
  if (log && Date.now() - (
    (
      log.id / 4194304
    ) + 1420070400000
  ) < 3000)
  {
    const user = log.executor
    embed.addFields([
      {
        name: `Информация о пользователе`,
        value: `**Кикнул:** ${user} (${user.id})\n**Пользователь:** ${member} (${member.user.id})`
      },
      {
        name: `Причина`,
        value: log.reason ? log.reason : `не найдена`
      }
    ])
    embed.setDescription(`${member} ${member.user.username}#${member.user.discriminator} был кикнут с Discord сервера`)
  } else {
    embed.setDescription(`${member} ${member.user.username}#${member.user.discriminator} вышел с Discord сервера`)
  }

  channelLog.send({
    embeds: [embed]
  })
}