const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors
} = require('discord.js')
const fs = require('fs')
const path = require('path')
module.exports = {
  name: 'modules', // название команды
  descr: 'Управление модулями в боте', // описание команды
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
      name: 'модуль',
      description: 'Модуль с которым Вы производите действие',
      type: ApplicationCommandOptionType.String,
      choices: fs.readdirSync(path.resolve('./modules')).map(moduleName => moduleName.split('.js')[0]).map((moduleName) => {
        return {
          name: moduleName,
          value: moduleName
        }
      }),
      required: true
    }
  ], // аргументы

  run: async ({
    bot, interaction, args, guild,
  }) => {
    const action = args[0];
    const moduleName = args[1];

    if (action === 'restart') {
      // делаем рестарт модуля

      // Убираем все прослушки модуля.
      for (const listener of bot.listeners(moduleName)) {
        await bot.off(moduleName, listener)
      }
      delete require.cache[
        path.resolve(`./modules/${moduleName}.js`)
        ]
      const listener = require(path.resolve(`./modules/${moduleName}.js`))
      await bot.on(moduleName, listener.bind(null, bot))
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Система управления модулями!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setDescription(
              `**Модуль \`${moduleName}\` был успешно перезагружен!**`
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
      if (bot.listeners(moduleName).length > 0) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Данный модуль уже прослушивается!**`)
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
      const listener = require(path.resolve(`./modules/${moduleName}.js`))
      await bot.on(moduleName, listener.bind(null, bot))
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Система управления модулями!`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setDescription(
              `**Модуль \`${moduleName}\` был успешно загружен!**`
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
      // Убираем все прослушки модуля.
      for (const listener of bot.listeners(moduleName)) {
        await bot.off(moduleName, listener)
      }
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
            .setTitle(`📌 | Отключение модуля`)
            .setDescription(`**Модуль \`${moduleName}\` был успешно отключен!**`)
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
