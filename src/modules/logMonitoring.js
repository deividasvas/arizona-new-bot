const { EmbedBuilder, Colors } = require("discord.js");
const getAllrolesIdAdmins = require("../components/getAllrolesIdAdmins");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для поддержки системы лога мониторинга. Создан для того, чтобы при нажатии кнопок
    принятия или отказа определённого мониторинга выдавался определённый ответ.
  */
  name: "logMonitoring", // имя модуля
  acceptCustomsID: ["log_monitoring_yes", "log_monitoring_no"], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot, interaction, user, guild, message }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

    if (
      !user.roles.cache.find((role) => getAllrolesIdAdmins().includes(role.id))
    ) {
      // проверяем, есть ли у человека нажавшего кнопку админские роли. Если нет, то отвечаем что нет доступа.
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`🚫 | Ошибка!`)
            .setDescription(`**Вы не являетесь администратором!**`)
            .setColor(Colors.DarkGreen)
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
      case "log_monitoring_yes": {
        message.edit({
          content: `${message.content}`,
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.DarkRed)
              .setTitle(`📌 | Рассмотрено`)
              .addFields(message.embeds[0].fields[0], {
                name: `📌・Результат проверки`,
                value: `>>> **「🎸」Статус: \`Найдены подозрительные действия\`\n「🔥」Проверил: ${user}**`,
                inline: true,
              })
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

      case "log_monitoring_no": {
        message.edit({
          content: `${message.content}`,
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.DarkRed)
              .setTitle(`📌 | Рассмотрено`)
              .addFields(message.embeds[0].fields[0], {
                name: `📌・Результат проверки`,
                value: `>>> **「🎸」Статус: \`Ничего не найдено\`\n「🔥」Проверил: ${user}**`,
                inline: true,
              })
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
