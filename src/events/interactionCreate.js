const { EmbedBuilder } = require("discord.js");
const handleErrors = require("../components/handleErrors.js");
const { developers } = require("../configs/settings.js");

module.exports = async (bot, interaction) => {
  if (interaction.isChatInputCommand()) {
    // если это команда, то мы её обрабатываем
    // обработка команд
    const { commandName, commandId, guild, channelId } = interaction;
    const command = bot.commands.get(commandName);
    if (!command) {
      await bot.deleteSlashCommand(commandId, guild); // если нет команды, то удаляем команду чтоб не показывалась
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`🚫 | Ошибка!`)
            .setDescription(`**Данной команды не существует**`)
            .setColor(`#ff0022`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    const args = interaction.options._hoistedOptions.map((arg) => arg.value);
    const author = interaction.member;
    const channel =
      interaction.guild.channels.cache.get(channelId) ||
      (await interaction.guild.channels.fetch(channelId));
    return command
      .run({ interaction, author, guild, bot, channel, args, developers })
      .catch((err) => handleErrors(err, bot));
  }
  if (interaction.isButton()) {
    // если это кнопка, то передаём её модулям
    for (const module of bot.modules.values()) {
      // берём все модули и смотрим в каком принимаются айдишники которые нам нужны
      const { acceptCustomsID } = module;
      if (acceptCustomsID.includes(interaction.customId)) {
        const { member: user, guild, message } = interaction;
        module.run({ bot, user, interaction, guild, message }); // запускаем модуль
      }
    }
  }
};
