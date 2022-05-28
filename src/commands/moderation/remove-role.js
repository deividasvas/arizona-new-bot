const { EmbedBuilder, ApplicationCommandOptionType, Colors, MessageMentions } = require('discord.js')
const getAllRolesIdModers = require('../../components/getAllRolesIdModers')
const getAllRolesIdState = require('../../components/getAllRolesIdState')
const sendUserMessage = require('../../components/sendUserMessage')
const setModerInfoParam = require('../../components/setModerInfoParam')

module.exports = {
  name: 'remove-role', // название команды
  descr: 'Снять роль у пользователя', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'пользователь',
      description: 'Пользователь которому Вы хотите снять роль',
      type: ApplicationCommandOptionType.User,
      required: true
    },

    {
      name: 'причина',
      description: 'Причина по которой Вы хотите снять ему роль',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ], // аргументы
  perms: (rolesId) => {
    return getAllRolesIdModers(rolesId) // все модерские роли
  }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, rolesId, channelsId }) => {
    const user = guild.members.cache.get(args[0])
    const reason = args[1]
    const stateRolesId = getAllRolesIdState(rolesId)
    const roleForRemove = user.roles.cache.find((role) => stateRolesId.includes(role.id) && role.id !== rolesId.stateEmployee)
    if (!roleForRemove) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**У пользователя нет гос.ролей для снятия!**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    user.roles.remove([roleForRemove, rolesId.stateEmployee], `Снятие роли by ${author.displayName}`)
    const logRolesChannel = guild.channels.cache.get(channelsId.logRoles)
    logRolesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setTitle(`😒 | Снятие роли`)
          .setDescription(`**「✨」Роль: ${roleForRemove}
          「😣」Кому: ${user} (${user.id})
          「👮‍♂️」Кто: ${author.displayName} (${author.id})
          「📄」Причина: \`${reason}\`**`)
          .setColor(Colors.Blue)
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    })

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`😒 | Снятие роли`)
          .setDescription(
            `**Вы успешно сняли роль ${roleForRemove} пользователю ${user}. Причина: \`${reason}\`**`
          )
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    })

    await sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`😒 | Снятие роли`)
          .setDescription(
            `**Вам была снята роль \`${roleForRemove.name}\` модератором ${author}.\nПричина: \`${reason}\`.**`
          )
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    }, user.id, guild)

    // Выдаем баллы и снятые роли в модерскую статистику.

    await setModerInfoParam(author.id, guild.id, 'main', 'removedRole', ({ removedRole }) => {
      return removedRole + 1;
    })

    await setModerInfoParam(author.id, guild.id, 'week', 'removedRole', ({ removedRole }) => {
      return removedRole + 1;
    })

    await setModerInfoParam(author.id, guild.id, 'main', 'balls', ({ balls, rates }) => {
      return balls + rates.removeRole;
    })

    await setModerInfoParam(author.id, guild.id, 'week', 'balls', ({ balls, rates }) => {
      return balls + rates.removeRole;
    })
  }
}
