const { Colors, EmbedBuilder } = require('discord.js')
const { scheduleJob } = require('node-schedule')
const { getGuildChannelsId, getGuildRolesId } = require('../configs/settings')
const Moderators = require('../models/Moderators')

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы снимать модераторам неактивы когда они кончатся.
  */
  autoRun: true, // автоматический запуск модуля
  name: 'neactives', // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

    // Получаем всех модераторов которые находятся в неактиве.
    const allNonactivesModerators = await Moderators.find({
        'neactive.active': true
      }
    )
    for (const moderator of allNonactivesModerators) {
      const rolesId = getGuildRolesId(moderator.guildId);
      const channelsId = getGuildChannelsId(moderator.guildId);
      const { neactive } = moderator
      const guild = bot.guilds.cache.get(moderator.guildId)
      const moderatorMember = guild.members.cache.get(moderator.userId)
      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`📌 | Конец неактива!`)
        .setTimestamp()
        .setDescription(`**「📝」Выдавал: <@${moderatorMember.id}>\n「😭」Кому: <@${moderator.userId}>\n「📕」Причина: \`${neactive.reason}\`\n「📅」Неактив снят**`)
        .setAuthor({
          name: guild.name, iconURL: guild.iconURL()
        })
        .setFooter({
          text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
        })
      // Если время конца неактива уже прошло, то просто снимаем неактив.
      if (neactive.dateEnd <= new Date()) {
        const neactiveLogChannel = guild.channels.cache.get(channelsId.neactiveLog)
        neactiveLogChannel.send({
          embeds: [embed]
        })
        moderatorMember.roles.remove(rolesId.neactive)
        return Moderators.updateOne({
          userId: moderator.userId,
          guildId: moderator.guildId
        }, {
          $set: {
            neactive: {
              ...neactive,
              active: false
            }
          }
        })
      }

      // Снимаем неактив по истечению времени неактива.
      scheduleJob(`${moderator.guildId}-${moderator.userId}-neactive`, neactive.dateEnd, async () => {
        const neactiveLogChannel = guild.channels.cache.get(channelsId.neactiveLog)
        neactiveLogChannel.send({
          embeds: [embed]
        })
        moderatorMember.roles.remove(rolesId.neactive)
        await Moderators.updateOne({
          userId: moderator.userId,
          guildId: moderator.guildId
        }, {
          $set: {
            neactive: {
              ...neactive,
              active: false
            }
          }
        })
      })
    }
  }
}
