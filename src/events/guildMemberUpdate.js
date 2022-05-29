const { channelsId: _channelsId, rolesId: _rolesId } = require('../configs/settings')
const { EmbedBuilder, Colors, AuditLogEvent } = require('discord.js')
const getAllRolesIdModers = require('../components/getAllRolesIdModers')
const getAllRolesIdAdmins = require('../components/getAllRolesIdAdmins')
const getAllRolesIdFamilies = require('../components/getAllRolesIdFamilies')
const createModerInfo = require('../components/createModerInfo')
const Moderators = require('../models/Moderators')
const getModerInfo = require('../components/getModerInfo')

const logAction = async (bot, oldMember, newMember) => {
  const { guild } = newMember
  const channelsId = _channelsId[guild.id]

  const logRolesAndBansChannel = guild.channels.cache.get(channelsId.rolesAndBans)
  const logUsersChannel = guild.channels.cache.get(channelsId.logUsers)

  const logs = await guild.fetchAuditLogs({
    before: null,
    limit: 5,
    type: AuditLogEvent.MemberUpdate
  }).then(audit => audit.entries.first())

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setAuthor({
      name: guild.name, iconURL: guild.iconURL()
    })
    .setTimestamp()
    .setFooter({
      text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
    })
    .setDescription(`${newMember} ${newMember.user.username}#${newMember.user.discriminator} ${newMember.nickname ? `(${newMember.nickname})` : ''} был обновлен`)

  if (oldMember && newMember.nickname !== oldMember.nickname) {
    embed.addFields([
        {
          name: `Изменение никнейма`,
          value: `**Было:** ${oldMember.nickname ? oldMember.nickname : oldMember.user.username}#${oldMember.user.discriminator}\n**Стало:** ${newMember.nickname ? newMember.nickname : newMember.user.username}#${newMember.user.discriminator}`
        }
      ]
    )
    if (!logs) {
      embed.addFields([
        {
          name: `Информация`,
          value: `**Изменил:** ${newMember} (${newMember.id})`
        }
      ])
    } else {
      const user = await guild.members.cache.get(logs.executor.id)
      if (user.id === newMember.user.id) {
        embed.addFields([
          {
            name: `Информация`,
            value: `**Изменил:** ${user} (${user.id})`
          }
        ])
      } else {
        embed.addFields([
          {
            name: `Информация`,
            value: `**Изменил:** ${user} (${user.id})\n**Пользователь:** ${newMember} (${newMember.id})`
          }
        ])
      }
    }
    return await logUsersChannel.send({ embeds: [embed] })
  }

  if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    const rolesLogsOfServerAudit = await guild.fetchAuditLogs({
      before: null,
      limit: 5,
      type: 25
    }).then(audit => audit.entries.first())

    if (!rolesLogsOfServerAudit) {
      return null
    }

    const user = guild.members.cache.get(rolesLogsOfServerAudit.executor.id)
    let newRolesId = []
    let giveRoleId
    newMember.roles.cache.forEach(role => newRolesId.push(role.id))

    for (const newRoleId of newRolesId) {
      if (!oldMember.roles.cache.has(newRoleId)) {
        giveRoleId = newRoleId
      }
    }

    const role = guild.roles.cache.get(giveRoleId)
    if (role) {
      embed.addFields([
        {
          name: `Изменение ролей`,
          value: `➕ ${role.name}`
        }
      ])
      if (role.color) {
        embed.setColor(role.color)
      } else {
        embed.setColor(Colors.Blue)
      }
      embed.addFields([
        {
          name: `Информация`,
          value: `**Выдал:** ${user} (${user.id})\n**Пользователь:** ${newMember} (${newMember.id})`
        }
      ])

      return logRolesAndBansChannel.send({
        embeds: [embed]
      })
    }
  }

  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    const rolesLogsOfServerAudit = await guild.fetchAuditLogs({
      before: null,
      limit: 5,
      type: 25
    }).then(audit => audit.entries.first())

    if (!rolesLogsOfServerAudit) {
      return null
    }

    const user = guild.members.cache.get(rolesLogsOfServerAudit.executor.id)
    let oldRolesId = []
    let removeRoleId
    oldMember.roles.cache.forEach(role => oldRolesId.push(role.id))

    for (const oldRoleId of oldRolesId) {
      if (!newMember.roles.cache.has(oldRoleId)) {
        removeRoleId = oldRoleId
      }
    }

    const role = guild.roles.cache.get(removeRoleId)
    if (role) {
      embed.addFields([
        {
          name: `Изменение ролей`,
          value: `➖ ${role.name}`
        }
      ])
      if (role.color) {
        embed.setColor(role.color)
      } else {
        embed.setColor(Colors.Blue)
      }
      embed.addFields([
        {
          name: `Информация`,
          value: `**Снял:** ${user} (${user.id})\n**Пользователь:** ${newMember} (${newMember.id})`
        }
      ])

      return logRolesAndBansChannel.send({
        embeds: [embed]
      })
    }
  }
}

const securityLog = async (bot, oldMember, newMember) => {
  const { guild } = newMember
  const rolesId = _rolesId[guild.id]
  const channelsId = _channelsId[guild.id]
  if (oldMember._roles.length === newMember._roles.length) return // Если с ролями нет взаимодействий, то пропускаем.
  if (newMember.user.bot) return // Бот не принимается!

  // Все роли которые логируются при выдаче обычным пользователем.
  const allLogRoles = [
    // Все модерские роли
    ...getAllRolesIdModers(rolesId),
    // Все админские роли
    ...getAllRolesIdAdmins(rolesId),
    // Все семейные роли
    ...await getAllRolesIdFamilies(rolesId),
    // Легендарный олд сюрпрайза
    rolesId.legendaryOldSurprise,
    // Технический отдел дискорда
    rolesId.techSection,
    // Боты
    rolesId.bots,
    // Legendary surprise
    rolesId.legendarySurprise
  ]
  if (oldMember._roles.length < newMember._roles.length) {
    // Если пользователю выдали роль.

    // Получаем айди новой выданной роли.
    let oldRolesId = []
    let newRoleId

    for (const [id, role] of oldMember.roles.cache) {
      oldRolesId.push(id)
    }
    for (const [id, role] of newMember.roles.cache) {
      // Если новой роли нет в старых, то значит стопаем цикл.
      if (!oldRolesId.some(roleId => roleId === role.id)) {
        newRoleId = role.id
        break
      }
    }

    const role = guild.roles.cache.get(newRoleId)

    // Если выданная роль это младший модератор, то вероятнее всего это поставили модератора, поэтому нужно сделать ему статистику
    if (role.id === rolesId.juniorModerator) {
      await createModerInfo(newMember.id, guild.id)
    }

    // Если роль не относится к тем которые логируются, то ничего не делаем.
    if (!allLogRoles.includes(role.id)) {
      return
    }
    const entry = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate }).then(audit => audit.entries.first())
    const member = await guild.members.cache.get(entry.executor.id)
    bot.sendConferenceDiscordMastersMessage(`Выдана роль - ${role.name}\n Выдал - ${member.displayName} [${member.id}]\n Кому - ${newMember.displayName} [${newMember.id}]`)
  }

  if (oldMember._roles.length > newMember._roles.length) {
    // Если пользователю сняли роль.

    // Получаем айди снятой роли.
    let newRolesId = []
    let oldRoleId

    for (const [id, role] of newMember.roles.cache) {
      newRolesId.push(id)
    }
    for (const [id, role] of oldMember.roles.cache) {
      // Если новой роли нет в новых, то значит стопаем цикл.
      if (!newRolesId.some(roleId => roleId === role.id)) {
        oldRoleId = role.id
        break
      }
    }

    const role = guild.roles.cache.get(oldRoleId)

    // Если снятая роль это младший модератор, то вероятнее всего это сняли модератора, поэтому нужно удалить ему статистику
    if (role.id === rolesId.juniorModerator) {
      const {
        main: {
          roles,
          tickets,
          bans,
          kicks,
          removedRole,
          immunities,
          coefficient,
          balls,
          toxicAnswers,
          goodAnswers,
          mutes
        },
        warns: warnsOrRebukes
      } = await getModerInfo(bot, guild.id, newMember.id)
      const warns = warnsOrRebukes.filter(warnOrRebuke => warnOrRebuke.group === 'warn')
      const rebukes = warnsOrRebukes.filter(warnOrRebuke => warnOrRebuke.group === 'rebuke')

      await Moderators.deleteOne({
        guildId: guild.id,
        userId: newMember.id
      })
      const curatorsChannel = guild.channels.cache.get(channelsId.curators)
      curatorsChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`\`Снятие модератора:\`**${newMember.displayName}**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            }).setDescription(`**Сняли: <@${newMember.id}>[\`${newMember.id}\`]\n\`\`\`\nСтатистика модератора до снятия\`\`\`\nВыданные/отказанные роли: \`${roles}\`\nОтвеченные тикеты: \`${tickets}\`\nЗаблокировано пользователей: \`${bans}\`\nКикнуто пользователей: \`${kicks}\`\nЗамучено пользователей: \`${mutes}\`\nКоличество хороших оценок: \`${goodAnswers}\`\nКоличество плохих оценок: \`${toxicAnswers}\`\nКоличество баллов: \`${balls}\`\nМножитель баллов(\`1 - х2, 2 - х3\`): \`${coefficient}\`\nВыговоров: \`${rebukes.length}\`\nПредупреждений: \`${warns.length}\`\nИммунитетов: \`${immunities}\`\nСнятые роли: \`${removedRole}\`**`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    // Если роль не относится к тем которые логируются, то ничего не делаем.
    if (!allLogRoles.includes(role.id)) {
      return
    }
    const entry = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate }).then(audit => audit.entries.first())
    const member = await guild.members.cache.get(entry.executor.id)
    bot.sendConferenceDiscordMastersMessage(`Снята роль - ${role.name}\n Снял - ${member.displayName} [${member.id}]\n Кому - ${newMember.displayName} [${newMember.id}]`)
  }
}

module.exports = async (bot, oldMember, newMember) => {
  await logAction(bot, oldMember, newMember)
  await securityLog(bot, oldMember, newMember)
}