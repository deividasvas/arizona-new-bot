const { EmbedBuilder, Colors } = require("discord.js");
const getAllRolesIDAdmins = require("../components/getAllRolesIdAdmins");
const passTimer = require("../components/passTimer");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы обработать приглашение в семью у которого истёк срок. У приглашения в команде
    faminvite есть срок, это два часа, после двух часов оно не работает, данный модуль смотрит прошло ли 2 часа, и если
    прошло, то отправляет что уже прошло 2 часа, и нужно по новой отправить приглашение.
  */
  autoRun: true, // автоматический запуск модуля
  name: "pass", // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot, guild }) => {
    setInterval(() => {
        guild.members.cache.forEach(el => {
            passTimer(bot, guild, el.id)
        });
    }, 50000)
  },
};
