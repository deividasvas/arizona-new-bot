const {
  EmbedBuilder,
  Colors,
  ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");

module.exports = {
  name: "aroles", // название команды
  descr: "Напомнить пользователям про существование канала запрос-ролей", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, rolesId, channelsId, interaction, guild }) => {
    const welcome = guild.channels.cache.get(channelsId.welcome);
    welcome.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📌 | Просим минуточку внимания!")
          .setColor(0x6ee9fa)
          .setTimestamp()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
          .addFields({
            name: `**Для того что бы получить роль надо:**`,
            value:
              `\**「1️⃣」Вам нужно составить ник по форме. \nФорма ника: [Фракция][Ранг] Ваш ник-нейм.\nВсе тэги можете найти в __закрепленных сообщениях__!. \nПример ника: [GOV][1] Name_Surname\n————————————**\n` +
              `\**「2️⃣」Далее нужно зайти в канал <#${channelsId.requestRoles}>, после чего Вам нужно нажать на кнопку "Запросить роль фракции", ничего более!\n————————————**\n` +
              `\**「3️⃣」Последний пункт, вам остаётся ждать, пока модераторы одобрят / отклонят запрос\n————————————**\n`,
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
            `**Вы успешно прорекламировали канал <#${channelsId.requestRoles}> в канале <#${channelsId.welcome}>**`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
