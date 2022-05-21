const { channelsId } = require("../configs/settings");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы если новичок или кто-то ещё написал слово роль или дайте роль в общий чат
    то ему бот автоматически ответил что ему следует делать.
  */
  name: "trigger", // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  autoRun: false, // автоматический запуск модуля
  run: async ({bot, message}) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
    if (
      message.channel.id === channelsId[message.guild.id].welcome
    ) {
      const triger = ["роль", "дайте роль"];
      if (triger.includes(message.content.toLowerCase())) {
        message.reply({
          content:
            "**Друг, ты ошибся каналом! Клацни на этот канал:** <#885995146326441994>**. Там ты и сможешь запросить роль. \nТакже хочу напомнить, что роль выдают модераторы.**",
        });
      }
    }
  },
};
