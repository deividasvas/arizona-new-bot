const { EmbedBuilder, ApplicationCommandOptionType, Colors, MessageMentions } = require('discord.js')
const getAllrolesIdModers = require('../../components/getAllRolesIdModers')
const parseUserIdFromMention = require('../../components/parseIdFromMention')

module.exports = {
  name: 'org', // название команды
  descr: 'Проверить игрока на НСО(Не состоящий в организации)', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'пользователь',
      description: 'Пользователь которого Вы хотите проверить на факт НСО',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ], // аргументы
  archive: true,
  perms: (rolesId) => {
    return getAllrolesIdModers(rolesId) // все модерские роли
  }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, rolesId, channelsId }) => {
    if (!bot.fractions.init) {
      // если фракции ещё не инициализированы, то отдаём ошибку.
      return interaction.reply({
        ephemeral: true, embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Данные об организациях на данный момент не прогружены до конца. Ожидайте конца загрузки данных.\nОбычно, этот процесс занимает около 2 минут.**`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    // Функция, которая отдаёт итоговый эмбед с данными о состоянии игрока в организации.
    // Используется если игрок состоит в организации.
    const getEmbed = player => {
      if (player.isPlayerInFraction) {
        return new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`📌 | Проверка на НСО`)
          .setDescription(`**Последнее обновление данных: ${bot.fractions.dateOldInit.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${bot.fractions.dateOldInit.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}**`)
          .addFields([
            {
              name: `Проверил модератор`, value: `${author} (${author.user.tag})`
            }, {
              name: `Название фракции`, value: `${player.orgName}`
            }, {
              name: `Никнейм игрока`, value: player.nickname
            }, {
              name: `Статус онлайна`, value: player.isOnline ? 'В сети' : 'Не в сети'
            }, {
              name: `Должность`, value: `${player.rankName} (${player.rank})`
            }
          ])
          .setTimestamp()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
          })
      } else {
        return new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`📌 | Проверка на НСО`)
          .setTimestamp()
          .setDescription(`**Игрок \`${player.nickname}\` не состоит в организации\n Последнее обновление данных: ${bot.fractions.dateOldInit.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${bot.fractions.dateOldInit.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}**`)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
          })
      }
    }
    const userNickNameOrUnParsedMention = args[0] // никнейм пользователя или не распарсенный пинг пользователя

    // Функция для проверки состоит ли пользователь в организации. Отдаёт информацию об игроке и фракции.
    // Принимает только тестовый никнейм
    const getPlayerFraction = (nickname) => {
      if (!bot.fractions.init) {
        return {
          init: false
        }
      }
      const gosOrgsId = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23, 24, 26, 27, 29]
      const namesFractions = {
        1: `Полиция ЛС`,
        2: `RCSD`,
        3: `FBI`,
        4: `Полиция СФ`,
        5: `Больница LS`,
        6: `Правительство LS`,
        7: `Тюрьма строгого режима LV`,
        8: `Больница СФ`,
        9: `Инструкторы`,
        10: `TV студия`,
        20: `Армия ЛС`,
        21: `Центральный Банк`,
        22: `Больница LV`,
        23: `LVMPD`,
        24: `TV студия LV`,
        26: `TV студия SF`,
        27: `Армия SF`,
        29: `Страховая компания`
      }
      for (let gosOrgId of gosOrgsId) {
        const fractionName = namesFractions[gosOrgId]
        const fraction = bot.fractions.data.find(fraction => fraction.id === gosOrgId)
        for (let fractionMember of (
          fraction.members || []
        ))
        {
          if (fractionMember.name.toLowerCase() === nickname.toLowerCase()) {
            return {
              orgName: fractionName,
              isPlayerInFraction: true,
              isOnline: fractionMember.isOnline,
              init: true,
              rank: fractionMember.rank,
              rankName: fractionMember.rankLabel,
              isLeader: fractionMember.isLeader,
              nickname: fractionMember.name
            }
          }
        }
      }
      return {
        isPlayerInFraction: false, init: false, nickname
      }
    }

    // Проверяем, является ли переданный пользователь завуалированным упоминанием.
    if (MessageMentions.UsersPattern.test(userNickNameOrUnParsedMention)) {
      // Если да, то получаем айди пользователя и самого пользователя соответственно.
      const userId = parseUserIdFromMention(userNickNameOrUnParsedMention)
      const member = guild.members.cache.get(userId)

      // Как только получили пользователя, то убираем все не нужные знаки(если они есть)
      // в нике пользователя и затем передаём его на проверку на НСО
      let nickname = '' // результативный никнейм.
      const splitedPreNickname = member?.nickname.split(']') || [] // разделяем по ] чтобы можно было отсеять среди дискорд формы - ник
      Array.from(splitedPreNickname[splitedPreNickname.length - 1]).map((letter) => {
        // Проходимся по всем символам никнейма. Начиная после тега ранга.
        if (/^[a-zA-Z-_" "]+$/.test(letter)) {
          // проверяем, является ли символ английском.
          nickname += letter // если да, то добавляем его в слово
        } else {
          nickname += ' ' // если нет, то просто ставим пробел. Сделано для того чтобы если знак был между ником, то его было можно легко заменить
        }
      })
      // Если у пользователя вместо нижнего подчёркивания стоит пробел, то заменяем его на нижнее подчёркивание.
      nickname = nickname.trim().replace(' ', '_')

      const player = getPlayerFraction(nickname)
      return interaction.reply({
        embeds: [getEmbed(player)]
      })
    }

    // Если это всё-таки просто ник передан, то просто заменяем пробел если он присутствует на нижнее подчёркивание.
    const nickname = userNickNameOrUnParsedMention.replace(' ', '_')
    const player = getPlayerFraction(nickname)
    return interaction.reply({
      embeds: [getEmbed(player)]
    })

  }
}
