const { EmbedBuilder, Colors } = require("discord.js");
const getAllrolesIdAdmins = require("../components/getAllRolesIdAdmins");
const {rolesId} = require("../configs/settings");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для поддержки системы лога мониторинга. Создан для того, чтобы при нажатии кнопок
    принятия или отказа определённого мониторинга выдавался определённый ответ.
  */
  autoRun: false, // автоматический запуск модуля
  name: "logMonitoring", // имя модуля
  acceptCustomsId: ["logMonitoringYes", "logMonitoringNo"], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot, interaction, member: user, guild, message }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

    if (
      !user.roles.cache.find((role) => getAllrolesIdAdmins(rolesId[guild.id]).includes(role.id))
    ) {
      // Проверяем, есть ли у человека нажавшего кнопку админские роли. Если нет, то отвечаем что нет доступа.
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
              .setTitle(`🚫 | Ошибка!`)
              .setDescription(`**Вы не являетесь администратором!**`)
              .setColor(Colors.Blue)
              .setTimestamp()
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
        ],
      });
    }
    // ниже идёт установка эмбедов в зависимости от выбранной кнопки
    switch (interaction.customId) {
      case "logMonitoringYes": {
        message.edit({
          content: `${message.content}`,
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Blue)
              .setTitle(`📌 | Рассмотрено`)
              .addFields([message.embeds[0].fields[0], {
                name: `📌・Результат проверки`,
                value: `>>> **「🎸」Статус: \`Найдены подозрительные действия\`\n「🔥」Проверил: ${user}**`,
                inline: true,
              }])
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
          components: [],
        });
        break;
      }

      case "logMonitoringNo": {
        message.edit({
          content: `${message.content}`,
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.DarkRed)
              .setTitle(`📌 | Рассмотрено`)
              .addFields([message.embeds[0].fields[0], {
                name: `📌・Результат проверки`,
                value: `>>> **「🎸」Статус: \`Ничего не найдено\`\n「🔥」Проверил: ${user}**`,
                inline: true,
              }])
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
          components: [],
        });
        break;
      }
    }
  },
};
