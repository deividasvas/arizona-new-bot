const { getGuildRolesId } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const {cancelJob} = require("node-schedule");
const sendUserMessage = require('../components/sendUserMessage')
const {EmbedBuilder, Colors} = require("discord.js");

// Функция снятие мута пользователю
const unmute = async (bot, guildId, userId, provocateur = "-", reason) => {
  const rolesId = getGuildRolesId(guildId);

  const punish = await Punishment.findOne({
    userId,
    guildId,
    action: "mute",
  }); // получаем наказание мут пользователя из бд
  if (!punish) {
    return null; // если мута нет, то ничего не делает
  }
  // мут есть, двигаемся дальше
  const guild = bot.guilds.cache.get(punish.guildId); // получаем сервер нарушителя
  const member =
    guild.members.cache.get(userId) || (await guild.members.fetch(userId)); // получаем самого нарушителя которому нужно снять мут
  member.timeout(
    1,
    provocateur === "-"
      ? `Снятие мута by System`
      : `Снятие мута через команду by ${provocateur.user?.tag || provocateur}`
  ); // снимаем ему мут.
  await member.roles.remove([rolesId.muted]); // удаляем роль `Muted`
  cancelJob(`${guildId}-${userId}-mute-${punish.reason}`); // отменяем автоматическое снятие наказания через модуль punishment.js
  punish.remove(); // удаляем наказания из бд

  return true;
};

module.exports = unmute;
