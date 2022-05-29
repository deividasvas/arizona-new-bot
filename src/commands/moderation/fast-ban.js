const { ActionRowBuilder, Collection } = require('discord.js')
const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
  ButtonStyle,
  ButtonBuilder
} = require('discord.js')
const getAllRolesIdModers = require('../../components/getAllRolesIdModers')
const BansVotes = require('../../models/BansVotes')
const timeChecker = require('../../components/timeChecker')
const sendUserMessage = require('../../components/sendUserMessage')

const cooldownBans = new Collection()
setInterval(() => {
  for (const [dateStart, userId] of cooldownBans) {
    // Если прошло более 30 минут с момента появления человека в КД, то удаляем его от туда.
    if ((
      (
        new Date() - dateStart
      ) / 60000
    ) >= 30)
    {
      cooldownBans.delete(userId)
    }
  }
}, 5000)

module.exports = {
  name: 'fast-ban', // название команды
  descr: 'Быстрая блокировка пользователя', // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'пользователь',
      description: 'Пользователь которого Вы заблокировать на сервере',
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'срок',
      description: 'Срок в днях насколько Вы хотите заблокировать пользователя',
      type: ApplicationCommandOptionType.Number,
      required: true
    },
    {
      name: 'причина',
      description: 'Причина по которой Вы хотите заблокировать пользователя',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'доказательства',
      description: 'Укажите доказательства на блокировку ссылкой',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ], // аргументы
  perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({
    bot, interaction, author, guild, args, channelsId, whiteListRoles
  }) => {
    const userForBanId = args[0]
    const userForBan = guild.members.cache.get(userForBanId)
    const days = args[1]
    const reason = args[2]
    const proof = args[3]

    const roleInWhiteList = userForBan?.roles.cache.find((role) =>
      whiteListRoles.includes(role.id)
    ) // проверяем, есть ли у человека роль которая находится в белом списке по отношению к выдачам наказаний.
    if (roleInWhiteList) {
      // если у человека есть роль из белого списка ролей, то отвечаем запросившему что у пользователя роль из белого списка
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Пользователя <@${userForBanId}> невозможно наказать потому, что, у него есть роль <@&${roleInWhiteList.id}> которая находится в белом списке.**`
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

    if (cooldownBans.has(author.id)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Блокировать людей быстрой блокировкой можно раз в 30 минут! У Вас ещё не прошёл этот срок.**`
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

    const curatorsChannel = guild.channels.cache.get(channelsId.curators)
    const embed = new EmbedBuilder()
      .setTitle(`📌 | Быстрая система блокировки пользователей!`)
      .setColor(Colors.Blue)
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL()
      })
      .setDescription(
        `**「📝」Запросил бан: <@${author.id}>\n「📌」Кому: <@${userForBanId}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`\n「🗾」Доказательства: \`${proof}\`**`
      )
      .setTimestamp()
      .setFooter({
        text: `Robo Hamster`,
        iconURL: bot.user.displayAvatarURL()
      })
    curatorsChannel.send({
      embeds: [
        embed
      ],
      components: [
        new ActionRowBuilder()
          .addComponents([
            new ButtonBuilder()
              .setStyle(ButtonStyle.Success)
              .setLabel('Выдано верно')
              .setCustomId('fastBanGood'),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Danger)
              .setLabel('Выдано не верно')
              .setCustomId('fastBanBad')
          ])
      ]
    })
    await sendUserMessage(
      {
        content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Вам выдали блокировку!`)
            .setAuthor({
              name: interaction.guild.name,
              iconURL: interaction.guild.iconURL()
            })
            .setDescription(
              `**「📝」Выдал бан: <@${author.id}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      },
      userForBanId,
      interaction.guild
    )
    await userForBan.ban({
      days,
      reason
    })

    const bansLogsChannel = interaction.guild.channels.cache.get(
      channelsId[interaction.guild.id].rolesAndBans
    ) // канал куда отправляются логи банов
    await bansLogsChannel.send({
      embeds: [
        embed
      ]
    })

    await interaction.reply({
      ephemeral: true,
      embeds: [
        await new EmbedBuilder()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .setDescription(
            `**Вы успешно заблокировали пользователя ${userForBanId} на \`${days}\` дней. Причина: \`${reason}\`**`
          )
          .setColor(Colors.Blue)
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    })

    cooldownBans.set(author.id, new Date());
  }
}
