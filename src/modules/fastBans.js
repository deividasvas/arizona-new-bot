const { EmbedBuilder, Colors, Attachment } = require('discord.js')
const parseUserIdFromMention = require('../components/parseIdFromMention')
const sendUserMessage = require('../components/sendUserMessage')
const { getGuildRolesId, fastBanCoefficient } = require('../configs/settings')
const setModerInfoParam = require('../components/setModerInfoParam')

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы обработать кнопки эмбедов банов у модераторов.
  */
  autoRun: false, // автоматический запуск модуля
  name: 'fastBans', // имя модуля
  acceptCustomsId: ['fastBanGood', 'fastBanBad'], // модуль автоматически принимает эти айдишники interaction.customId
  // Функция для выдачи баллов модератору который выдал верно наказание.
  async giveBalls ({ moderatorId, guildId }) {
    await setModerInfoParam(
      moderatorId,
      guildId,
      'main',
      'bans',
      ({ bans }) => bans + 1
    )
    await setModerInfoParam(
      moderatorId,
      guildId,
      'week',
      'bans',
      ({ bans }) => bans + 1
    )

    // выдаем недельные баллы и общие
    await setModerInfoParam(
      moderatorId,
      guildId,
      'main',
      'balls',
      ({ balls, coefficient, rates }) => (
        balls + (
          rates.ban * coefficient
        ) * fastBanCoefficient
      )
    )
    await setModerInfoParam(
      moderatorId,
      guildId,
      'week',
      'balls',
      ({ balls, coefficient, rates }) => (
        balls + (
          rates.ban * coefficient
        ) * fastBanCoefficient
      )
    )
  },
  async run ({ bot, interaction, member }) {
    const guild = bot.guilds.cache.get(interaction.guildId)
    const rolesId = getGuildRolesId(guild.id)

    // Если у пользователя нет не одно из ролей руководства модерации, то пишем что недостаточно прав.
    if (!member.roles.cache.some(role => [
      rolesId.discordMaster,
      rolesId.juniorDiscordMaster,
      rolesId.adviceAdministration,
      rolesId.curatorModeration
    ].includes(role.id))) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Не достаточно прав! Данную возможность можно использовать от куратора модерации!**`
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
    // функция, которая отдаёт значение из колонок
    const getValue = (index) => interaction.message.embeds[0].description.split(':')[index].split('\n')[0].trim()

    const moderatorId = parseUserIdFromMention(getValue(1))
    const userId = parseUserIdFromMention(getValue(2))
    const userObject = await bot.users.fetch(userId)
    // Если пользователь нажал на кнопку выдано верно
    if (interaction.customId === 'fastBanGood') {
      await this.giveBalls({
        moderatorId,
        guildId: guild.id
      })

      await sendUserMessage({
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ | Выдано верно!`)
            .setColor(Colors.Blue)
            .setAuthor({
              name: interaction.guild.name,
              iconURL: interaction.guild.iconURL()
            })
            .setDescription(
              `**Вы в последнее время блокировали пользователя - <@${userId}> (${userObject.tag})\nРуководитель модерации ${member}\`(${member.displayName})\` подтвердил что блокировка выдана верно!\nВам было начислено \`Х${fastBanCoefficient}\` баллов!**`
            )
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      }, moderatorId, guild)

      const oldEmbed = interaction.message.embeds[0]
      await interaction.message.edit({
        components: [],
        content: `Один из актов быстрой блокировки пользователей был проверен!`,
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ | Выдано верно!`)
            .setColor(Colors.Green)
            .setDescription(`${oldEmbed.description}\n**「⏱️」Статус: \`Выдано верно\`\n「👮‍」Проверил: ${member}**`)
            .setAuthor(oldEmbed.author)
            .setFooter(oldEmbed.footer)
            .setTimestamp()
        ]
      })

      return null
    }

    // Если пользователь нажал на кнопку выдано неверно
    const oldEmbed = interaction.message.embeds[0]
    await interaction.message.edit({
      components: [],
      content: `Один из актов быстрой блокировки пользователей был проверен!`,
      embeds: [
        new EmbedBuilder()
          .setTitle(`❌ | Выдано неверно!`)
          .setColor(Colors.Red)
          .setDescription(`${oldEmbed.description}\n**「⏱️」Статус: \`Выдано неверно\`\n「👮‍」Проверил: ${member}**`)
          .setAuthor(oldEmbed.author)
          .setFooter(oldEmbed.footer)
          .setTimestamp()
      ]
    })
  }
}
