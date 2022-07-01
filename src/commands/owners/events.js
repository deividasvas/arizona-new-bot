const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors
} = require('discord.js')
const fs = require('fs')
const path = require('path')
module.exports = {
  name: 'events', // название команды
  descr: 'Управление событиями в боте', // описание команды
  perms: (rolesId) => [rolesId.discordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'действие',
      description: 'Действие которое Вы хотите произвести',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Перезапустить',
          value: 'restart'
        },
        {
          name: 'Запустить',
          value: 'start'
        },
        {
          name: 'Остановить',
          value: 'stop'
        }
      ],
      required: true
    },
    {
      name: 'событие',
      description: 'Событие с которым Вы производите действие',
      type: ApplicationCommandOptionType.String,
      choices: fs.readdirSync(path.join(__dirname, '../../', 'events')).map(eventName => eventName.split('.js')[0]).map((eventName) => {
        return {
          name: eventName,
          value: eventName
        }
      }),
      required: true
    }
  ], // аргументы

  run: async ({
    bot, interaction, args, guild, author, rolesId, channelsId
  }) => {
    const action = args[0]
    const eventName = args[1]

    if (action === 'restart') {
      // делаем рестарт эвента

      // Убираем все прослушки события.
      for (const listener of bot.listeners(eventName)) {
        await bot.off(eventName, listener)
      }
      delete require.cache[
        path.resolve(`./events/${eventName}.js`)
        ]
      const listener = require(path.resolve(`./events/${eventName}.js`))
      await bot.on(eventName, listener.bind(null, bot))
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Система управления событиями!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setDescription(
              `**Событие \`${eventName}\` было успешно перезагружено!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (action === 'start') {
      if (bot.listeners(eventName).length > 0) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              await new EmbedBuilder()
                .setTitle(`❌ | Ошибка!`)
                .setDescription(`**Данное событие уже прослушивается!**`)
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
      const listener = require(path.resolve(`./events/${eventName}.js`))
      await bot.on(eventName, listener.bind(null, bot))
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Система управления событиями!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setDescription(
              `**Событие \`${eventName}\` было успешно загружено!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (action === 'stop') {
      // Убираем все прослушки события.
      for (const listener of bot.listeners(eventName)) {
        await bot.off(eventName, listener)
      }
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
            .setTitle(`📌 | Отключение события`)
            .setDescription(`**Событие \`${eventName}\` было успешно отключено!**`)
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
  }
}
