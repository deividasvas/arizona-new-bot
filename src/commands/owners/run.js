const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const settings = require("../../configs/settings");
const { rolesId } = require("../../configs/settings");
module.exports = {
  name: "run", // название команды
  descr: "Запускает JavaScript код", // описание команды
  perms: () => [rolesId.techSection], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  private: false, // ограничена в использовании
  arguments: [
    {
      name: "код",
      description: "Код который будет запущен",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы

  run: async ({ bot, interaction, channel, args, developers, author }) => {
    
    if (!developers.includes(author.user.id))
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`🚫 | Ошибка!`)
            .setDescription(`**Вам недоступна данная команда**`)
            .setColor(`RED`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    const code = args[0];
    const testChannel =
      bot.channels.cache.get(settings.channelsId.testRoom) ||
      (await guild.channels.fetch(settings.channelsId.testRoom));
    testChannel.send({
      content: `<@&${rolesId.techSection}>`,
      embeds: [
        new EmbedBuilder()
          .setTitle("📌 | Оповещение об использовании команды run!")
          .setDescription(
            `**Отправлено с ${channel} \`[${channel.id}]\`\nОтправил: ${author} \`[${author.user.id}]\`\n\nКод:\n\`\`\`js\n${code}\`\`\`**`
          )
          .setColor("#82ca32")
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    interaction.reply({
      ephemeral: true,

      embeds: [
        new EmbedBuilder()
          .setTitle("📌 | Оповещение об использовании команды run!")
          .setDescription(`**JavaScript выражение было успешно запущено!**`)
          .setColor("#82ca32")
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    eval(code);
  },
};
