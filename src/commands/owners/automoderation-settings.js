const {
  EmbedBuilder,
  Colors, ApplicationCommandOptionType
} = require('discord.js')
const getAutoModerationConfig = require('../../components/getAutoModerationConfig')
const setAutoModerationConfigParam = require('../../components/setAutoModerationConfigParam');

module.exports = {
  name: 'automoderation-settings', // название команды
  descr: 'Настройка автомодерации', // описание команды
  archive: false,
  perms: (rolesId) => [
    rolesId.discordMaster
  ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'действие',
      description: 'Действие которое Вы хотите совершить',
      choices: [
        {
          name: `Получить настройки`,
          value: `getSettings`
        },
        {
          name: `Изменить интервал на отправку сообщений`,
          value: `cooldownMessage`
        },
        {
          name: `Изменить интервал на отправку изображений`,
          value: `cooldownImages`
        },
        {
          name: `Изменить интервал на дублирование сообщение`,
          value: `cooldownDuplicate`
        },
        {
          name: `Изменить максимальное количество разрешенных массовых упоминаний`,
          value: `maxMentions`
        },
        {
          name: `Изменить максимальное количество разрешенных эмодзи в сообщений`,
          value: `maxEmojis`
        },
        {
          name: `Изменить минимальный коэффициент на капс`,
          value: `capsCoefficient`
        },
        {
          name: `Добавить в белый список ссылку`,
          value: `add-whiteListLinks`
        },
        {
          name: `Удалить ссылку из белого списка ссылок`,
          value: `remove-whiteListLinks`
        },
        {
          name: `Добавить в белый список категорию`,
          value: `add-ignoredCategoriesId`
        },
        {
          name: `Удалить категорию из белого списка категорий`,
          value: `remove-ignoredCategoriesId`
        },
        {
          name: `Добавить в белый список канал`,
          value: `add-ignoredChannelsId`
        },
        {
          name: `Удалить канал из белого списка каналов`,
          value: `remove-ignoredChannelsId`
        },
        {
          name: `Добавить в белый список роль`,
          value: `add-allowedRolesId`
        },
        {
          name: `Удалить роль из белого списка ролей`,
          value: `remove-allowedRolesId`
        },
      ],
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: `значение`,
      description: `Значение которое Вы хотите применить к Н-ому ключу`,
      type: ApplicationCommandOptionType.String,
      required: false,
    }
  ], // аргументы

  async run ({ bot, guild, rolesId, args, interaction }) {
    const action = args[0]
    const {
      cooldownLinks,
      maxMentions,
      maxEmojis,
      cooldownImages,
      capsCoefficient,
      cooldownDuplicate,
      cooldownMessage,
      whiteListLinks,
      ignoredChannelsId,
      allowedRolesId,
      ignoredCategoriesId
    } = getAutoModerationConfig()
    const parseSecond = (sec) => {
      return sec / 1000 + ' секунд'
    }
    if (action === 'getSettings') {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`Настройки автомодераций`)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
            .addFields([
              {
                name: `Интервал на отправку сообщения со ссылками:`,
                value: parseSecond(cooldownLinks)
              },
              {
                name: `Интервал на отправку изображений:`,
                value: parseSecond(cooldownImages)
              },
              {
                name: `Интервал на отправку дублированных сообщений:`,
                value: parseSecond(cooldownDuplicate)
              },
              {
                name: `Интервал на отправку одинаковых сообщений:`,
                value: parseSecond(cooldownMessage)
              },
              {
                name: `Количество максимальных упоминаний:`,
                value: `${maxMentions}`
              },
              {
                name: `Количество максимальных эмодзи:`,
                value: `${maxEmojis}`
              },
              {
                name: `Минимальный коэффициент на капс:`,
                value: `${capsCoefficient}`
              },
              {
                name: `Белый список ссылок:`,
                value: whiteListLinks.join(', ') || 'Отсутствует'
              },
              {
                name: `Белый список категорий:`,
                value: ignoredCategoriesId.map((id) => `<#${id}>`).join(', ') || 'Отсутствует'
              },
              {
                name: `Белый список каналов:`,
                value: ignoredChannelsId.map((id) => `<#${id}>`).join(', ') || 'Отсутствует'
              },
              {
                name: `Белый список ролей:`,
                value: allowedRolesId.map((id) => `<@&${id}>`).join(', ') || 'Отсутствует'
              }
            ])
        ]
      });
    }

    // Установка параметров для других значений.
    setAutoModerationConfigParam(args[0], args[1]);
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`📌 | Настройка автомодераций`)
          .setDescription(
            `**Действие к параметру \`${args[0]}\` было успешно применено!**`
          )
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
      ]
    })
  }
}
