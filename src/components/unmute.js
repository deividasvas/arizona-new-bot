const { EmbedBuilder } = require("discord.js");
const { rolesID, channelsID } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const sendUserMessage = require("./sendUserMessage");

const unmute = async (bot, userId, provocateur = "-") => {
  const punish = await Punishment.findOne({
    userId,
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
      : `Снятие мута через команду by ${provocateur.user.tag}`
  ); // снимаем ему мут.
  await member.roles.remove([rolesID.muted]); // удаляем роль `Muted`
  punish.remove(); // удаляем наказания из бд
  return true;
};

module.exports = unmute;
