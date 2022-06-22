const { AuditLogEvent, EmbedBuilder, Colors } = require('discord.js')
const sendUserMessage = require('../components/sendUserMessage')
const isUserAllowEditServer = require('../components/isUserAllowEditServer');

// Система анти-слива
module.exports = async (bot, role) => {
  const { guild } = role
  const entry = await guild.fetchAuditLogs({
    type: AuditLogEvent.RoleCreate,
    before: null,
    limit: 1
  }).then(logs => logs.entries.first())
  const member = guild.members.cache.get(entry.executor.id)

  // Если пользователь имеет админку, то просто оповещаем в конференцию ДМов в ВК что создалась роль.
  if (isUserAllowEditServer(member)) {
    return bot.sendConferenceDiscordMastersMessage(`[Создание роли] Администратор ${member.displayName} [${member.id}] создал роль ${role.name}`)
  }

  // Если пользователь не администратор, то снимаем с него все роли, удаляем роль, и пишем об этом в конференцию дискорд мастеров.

  for (const [id, role] of member.roles.cache) {
    if(id === guild.id){
      continue;
    }
    if(member.roles.cache.has(id)){
      await member.roles.remove(id)
    }
  }
  role.remove()
  bot.sendConferenceDiscordMastersMessage(`[Анти-слив] Пользователь ${member.displayName} [${member.id}] создал роль (${role.name}). С него сняты все роли по системе безопасности!.`)
  await sendUserMessage({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`🙁 | Система анти-слива!`)
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL()
        })
        .setDescription(
          `**С Вас были сняты все роли системой безопасности за создание ролей!\nЧтобы вернуть Ваши роли - обратитесь к Вашему руководству!**`
        )
        .setTimestamp()
        .setFooter({
          text: `Robo Hamster`,
          iconURL: bot.user.displayAvatarURL()
        })
    ]
  }, member.id, guild);
}