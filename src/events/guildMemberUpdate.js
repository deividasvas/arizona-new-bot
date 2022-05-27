const { channelsId: _channelsId } = require('../configs/settings')
const { EmbedBuilder, Colors } = require('discord.js')

const logAction = async (bot, oldMember, newMember) => {
  const { guild } = newMember
  const channelsId = _channelsId[guild.id]

  const logRolesAndBansChannel = guild.channels.cache.get(channelsId.rolesAndBans)
  const logUsersChannel = guild.channels.cache.get(channelsId.logUsers)

  const logs = await guild.fetchAuditLogs({
    before: null,
    limit: 5,
    type: 24
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

    const user = guild.members.cache.get(rolesLogsOfServerAudit.executor.id);
    let newRolesId = []
    let giveRoleId;
    newMember.roles.cache.forEach(role => newRolesId.push(role.id))

    for(const newRoleId of newRolesId){
      if(!oldMember.roles.cache.has(newRoleId)){
        giveRoleId = newRoleId;
      }
    }

    const role = guild.roles.cache.get(giveRoleId);
    if(role){
      embed.addFields([{
        name: `Изменение ролей`,
        value: `➕ ${role.name}`
      }]);
      if (role.color) {
        embed.setColor(role.color)
      } else {
        embed.setColor(Colors.Blue);
      }
      embed.addFields([{
        name: `Информация`,
        value: `**Выдал:** ${user} (${user.id})\n**Пользователь:** ${newMember} (${newMember.id})`,
      }])

      return logRolesAndBansChannel.send({
        embeds: [embed]
      });
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

    const user = guild.members.cache.get(rolesLogsOfServerAudit.executor.id);
    let oldRolesId = []
    let removeRoleId;
    oldMember.roles.cache.forEach(role => oldRolesId.push(role.id))

    for(const oldRoleId of oldRolesId){
      if(!newMember.roles.cache.has(oldRoleId)){
        removeRoleId = oldRoleId;
      }
    }

    const role = guild.roles.cache.get(removeRoleId);
    if(role){
      embed.addFields([{
        name: `Изменение ролей`,
        value: `➖ ${role.name}`
      }]);
      if (role.color) {
        embed.setColor(role.color)
      } else {
        embed.setColor(Colors.Blue);
      }
      embed.addFields([{
        name: `Информация`,
        value: `**Снял:** ${user} (${user.id})\n**Пользователь:** ${newMember} (${newMember.id})`,
      }])

      return logRolesAndBansChannel.send({
        embeds: [embed]
      });
    }
  }
}

module.exports = async (bot, oldMember, newMember) => {
  await logAction(bot, oldMember, newMember);
}