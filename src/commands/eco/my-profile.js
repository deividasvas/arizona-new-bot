const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require('discord.js')
const getCoinsProfile = require('../../components/getCoinsProfile')
const isActiveNickCustomFont = require('../../components/isActiveSendEmojiAndStickersFromOtherServers')
const convertMsToDays = require('../../components/convertMsToDays')
const isActiveSendEmojiAndStickersFromOtherServers = require('../../components/isActiveSendEmojiAndStickersFromOtherServers')

module.exports = {
  name: 'my-profile', // название команды
  descr: 'Узнать информацию о своём профиле', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'пользователь',
      description: 'Модератор которого Вы хотите проверить статистику (От JR.D и выше!)',
      type: ApplicationCommandOptionType.User,
      required: false
    }
  ], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
    if (channel.id !== channelsId.coins) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Данная команда доступна только в канале <#${channelsId.coins}>!**`
            )
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
    /* Пользователь которого профиль мы будем смотреть.
    Либо пользователь который передан первым аргументом, либо автор сообщения.
    */
    const member = args[0] ? guild.members.cache.get(args[0]) || (
      await guild.members.fetch(args[0])
    ) : author
    // Роли которым можно проверять чужой профиль
    const allowCheckOtherPeopleProfilesRolesId = [
      rolesId.discordMaster,
      rolesId.juniorDiscordMaster
    ]

    // Если пользователь передан и ролей у человека нет, то выдаём ему ошибку!
    if (args[0] && !author.roles.cache.some(role => allowCheckOtherPeopleProfilesRolesId.includes(role.id))) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Профиля других пользователей можно смотреть только от должности <@&${rolesId.juniorDiscordMaster}> и выше!**`)
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

    const {
      coins,
      promocode,
      isActiveCustomFontInNickname,
      platforms,
      sendEmojiAndStickersFromOtherServers,
      isDepositActive,
      depositCoins,
      userPass
    } = await getCoinsProfile(member.id, guild.id)
    // Количество дней которое можно отправлять стикеры и эмодзи с других серверов.
    const days = (convertMsToDays(new Date(sendEmojiAndStickersFromOtherServers?.dateEnd) - new Date()).toFixed(1));
    interaction.reply({
      ephemeral: false,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setTitle(`Профиль: \`${member.nickname || member.user.tag}\``)
          .setThumbnail(`${member.user.displayAvatarURL({
            format: 'png', size: 2048, dynamic: true
          })}`)
          .setDescription(`>>> **Количество Coins: \`${coins}\`\nИспользовать нестандартный шрифт: \`${isActiveCustomFontInNickname ? `Можно` : 'Нельзя'}\`\nВозможность отправлять стикеры/эмодзи с других серверов: \`${await isActiveSendEmojiAndStickersFromOtherServers(author.id, guild.id) ? `Присутствует (Ещё ${days} дней)` : `Отсутствует`}\`\nКоличество платформ: \`${platforms}\`\nПромокод: \`${promocode ? promocode : 'Не активировался'}\`\nСтатус депозита: \`${isDepositActive ? 'Активен' : 'Отключен'}\`\nДенег на депозите: \`${depositCoins.toFixed(4)}\`\nПодписка: \`${userPass ? 'Surprise User Pass' : 'Нет'}\`**`)
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })

  }
}
