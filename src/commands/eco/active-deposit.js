const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require('discord.js')
const getCoinsProfile = require('../../components/getCoinsProfile')
const getJuniperBotLevel = require('../../components/getJuniperBotLevel')
const { coinsRates: { minLevelDeposit } } = require('../../configs/settings')
const setUserCoinsParam = require('../../components/setUserCoinsParam')

module.exports = {
  name: 'active-deposit', // название команды
  descr: 'Активировать депозит', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [], // аргументы
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
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    const profile = await getCoinsProfile(author.id, guild.id)
    if (profile.isDepositActive) {
      return interaction.reply({
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**У Вас уже активен депозит!**`
            )
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`⌛ | Проверка...`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .setDescription(
            `**Ожидайте, происходит проверка данных.\nВ среднем загрузка данных длится около 3-20 секунд.\nПока идёт загрузка можете сыграть в гляделки с одним из наших котиков.**`
          )
          .setTimestamp()
          .setImage('https://www.cats-british.ru/files/articles/pochemu_koshka_smotrit_v_glaza.jpg')
          .setFooter({
            text: `Surprise Bot`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
    const level = await getJuniperBotLevel(bot, author.id, guild.id)
    if (level < minLevelDeposit) {
      return interaction.editReply({
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Депозит доступен с \`${minLevelDeposit}\`!\nВаш уровень: \`${level}\`!**`
            )
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    await setUserCoinsParam(author.id, guild.id, 'isDepositActive', true)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`💰 | Активация депозита!`)
          .setColor(Colors.Blue)
          .setDescription(`**Вы успешно активировали депозит!**`)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }
}
