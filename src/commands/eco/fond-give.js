const { EmbedBuilder, ApplicationCommandOptionType, Colors, Embed } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const path = require('path');
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const pathToConfig = path.resolve('./configs/coins.json');
module.exports = {
  name: "fadd", // название команды
  descr: "Вложить монеты в фонд Surprise", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
      {
        name: 'монеты',
        description: 'Количество монет, которое вы хотите вложить',
        type: ApplicationCommandOptionType.Number,
      }
  ], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
    const coinsToGive = args[0];

    const profile = await getCoinsProfile(author.id, guild.id);

    if(profile.coins < coinsToGive) {
        return interaction.reply({
            embeds: [
                await new EmbedBuilder()
                .setAuthor({
                    name: `Фонд 🎀 Surprise`,
                    iconURL: guild.iconURL()
                })
                .setDescription(`**Вы не можете вложить в фонд монет больше , чем у вас есть!**`)
                .setColor(Colors.Red)
                .setTimestamp()
                .setFooter({
                    text: `Robo Hamster`,
                    iconURL: bot.user.displayAvatarURL()
                })
            ]
        })
    }

    await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
        return coins - coinsToGive
    })

    interaction.reply({
        embeds: [
            await new EmbedBuilder()
            .setAuthor({
                name: `Фонд 🎀 Surprise`,
                iconURL: guild.iconURL()
            })
            .setDescription(`**Вы успешно вложили \`${coinsToGive}\` монет в фонд \`${guild.name}\`!**`)
            .setColor(Colors.Blue)
            .setTimestamp()
            .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
            })
        ]
    })
  }
};
