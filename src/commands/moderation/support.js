const {
  EmbedBuilder,
  Colors,
  ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");

module.exports = {
  name: "support", // название команды
  descr: "Сообщить пользователям об существовании support'a", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, channelsId, guild }) => {
    const welcome = guild.channels.cache.get(channelsId.welcome); // получаем канал куда будет отправлять эмбед
    welcome.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📌 | Просим минуточку внимания!")
          .setColor(Colors.DarkRed)
          .setTimestamp()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Уважаемые пользователи нашего Discord Сервера!\nЕсли у вас есть вопрос или проблема, то можете обратиться в канал \n<#${channelsId.support}>**`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
          .addFields({
            name: `**Запомните:**`,
            value:
              `\**「1️⃣」Команда модераторов не рассматривает жалобы на администрацию нашего игрового сервера!**\n` +
              `\**「2️⃣」Мы отвечаем на вопросы только связанные с нашим Discord сервером.**\n` +
              `\**「3️⃣」За оффтоп в <#${channelsId.support}> вы можете получить наказание!**\n`,
          }),
      ],
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle("📌 | Просим минуточку внимания!")
          .setColor(0xfab86e)
          .setTimestamp()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно про рекламировали канал <#${channelsId.support}> в канале <#${channelsId.welcome}>**`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
      ],
    });
  },
};
