const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const path = require('path')
const pathToConfig = path.resolve('./configs/coins.json');
module.exports = {
  name: "loto-fond", // название команды
  descr: "Узнать текущее состояние счёта фонда лотереи", // описание команды
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
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    delete require.cache[pathToConfig]
    const config = require(pathToConfig);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`💰 | Баланс фонда!`)
          .setColor(Colors.Blue)
          .setDescription(`**На данный момент баланс фонда составляет: \`${config.fundBalance}$\`!\nБаланс пополняется за счёт проигрышных ставок команды \`/loto-coin\`.\nУ пользователей есть шанс выиграть всю сумму фонда в команде описанной выше!**`)
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
};
