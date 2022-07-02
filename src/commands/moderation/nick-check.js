const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require('discord.js')
const getCoinsProfile = require('../../components/getCoinsProfile')
const convertDaysToMs = require('../../components/convertDaysToMs')
const convertMsToDays = require('../../components/convertMsToDays')
const isActiveNickCustomFont = require('../../components/isActiveSendEmojiAndStickersFromOtherServers')
module.exports = {
  name: 'nick-check', // название команды
  descr: 'Проверить пользователя на привилегию иметь нестандартный шрифт', // описание команды
  perms: (rolesId) => [
    rolesId.discordMaster,
    rolesId.juniorDiscordMaster,
    rolesId.adviceAdministration,
    rolesId.curatorModeration,
    rolesId.moderator,
    rolesId.juniorModerator
  ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'пользователь',
      description: 'Пользователь которому будет выдана привилегия использовать нестандартный шрифт',
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ], // аргументы

  async run ({ bot, interaction, channel, args, channelsId, guild }) {
    const userId = args[0]
    const member = guild.members.cache.get(userId)
    const { isActiveCustomFontInNickname } = await getCoinsProfile(userId, guild.id)

    interaction.reply({
      ephemeral: channel.id === channelsId.moderation,
      embeds: [
        await new EmbedBuilder()
          .setTitle(`Пользователь: \`${member.displayName}\``)
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .addFields([
            {
              name: `**Возможность иметь нестандартный шрифт в нике**`,
              value: isActiveCustomFontInNickname ? `\`Куплена\` ✅` : '\`Не куплена\` ❌',
              inline: true
            },
          ])
          .setFooter({
            text: `Surprise Bot`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }
}