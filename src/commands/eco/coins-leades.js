const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require('discord.js')
const CoinsUsers = require('../../models/CoinsUsers')

module.exports = {
  name: 'coins-leaders', // название команды
  descr: 'Лидеры по монетам на сервере', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel, channelsId }) => {
    // Делаем данную команду доступной только в канале coins
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

    const arr = (
      await CoinsUsers.find({
        guildId: guild.id
      })
    )
    const leaders = (
      arr.sort((userA, userB) => {
        return userB.coins - userA.coins
      })
    ).slice(0, 10)

    const answer = leaders.map((leader, index) => {
      return `${index + 1} | <@${leader.userId}> | ${leader.coins}`;
    });
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`💰 | Топ 10 лидеров по монетам`)
          .setColor(Colors.Blue)
          .setDescription(`**\`Место | Пользователь | Количество монет\`\n${answer.join('\n')}**`)
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
}
