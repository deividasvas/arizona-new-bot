const Punishment = require('../models/Punishment')
const { rolesId: _rolesId, channelsId: _channelsId } = require('../configs/settings')
const { EmbedBuilder, Colors } = require('discord.js')
let levelHigh = 0
module.exports = async (bot, member) => {
  const muteTheMember = await Punishment.findOne({
    guildId: member.guildId, userId: member.id, action: 'mute'
  })
  const { guild } = member
  const rolesId = _rolesId[guild.id]
  const channelsId = _channelsId[guild.id]
  if (muteTheMember) {
    member.roles.add(rolesId.muted, `Обход мута`)
  }

  const channelLog = guild.channels.cache.get(channelsId.joinsAndExits)

  if (levelHigh >= 10) {
    member.ban({ reason: 'ANTI-DDOS SYSTEM' })
    let channel = guild.channels.cache.get(channelsId.discordMaster)
    channel.send(`${member.id} - заблокирован системой A-DDOS.\nЗначение "levelhigh" = ${levelHigh}`)
  }
  setTimeout(() => {
    if (levelHigh > 0) {
      levelHigh--
    }
  }, 60000 * levelHigh)

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setAuthor({
      name: guild.name, iconURL: guild.iconURL()
    })
    .setTimestamp()
    .setFooter({
      text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
    })
    .setDescription(`${member} ${member.user.username}#${member.user.discriminator} присоединился в Discord сервер`)
    .addFields([
      {
        name: `Имя`, value: `${member.user.username}#${member.user.discriminator} (${member.id}) ${member}`
      },
      {
        name: `Присоединился`,
        value: `${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', hour12: false })}`
      },
      {
        name: `Возраст аккаунта`,
        value: `${Math.floor((
          new Date() - member.user.createdAt
        ) / 86400000)} дней`,
        inline: true
      }, {
        name: `Количество участников`, value: `${member.guild.memberCount}`, inline: true
      }
    ])
  channelLog.send({ embeds: [embed] })
}