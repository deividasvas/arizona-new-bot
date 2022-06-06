const { getGuildRolesId } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const {cancelJob} = require("node-schedule");

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
      : `Снятие мута через команду by ${provocateur.user.tag}`
  ); // снимаем ему мут.
  await member.roles.remove([rolesId.muted]); // удаляем роль `Muted`
  cancelJob(`${guildId}-${userId}-mute-${punish.reason}`); // отменяем автоматическое снятие наказания через модуль punishment.js
  punish.remove(); // удаляем наказания из бд

  await sendUserMessage(
    {
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`📌 | Система снятия мута!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Снял: <@${provocatorMember.id}> (${provocatorMember.user.tag})\n「📕」Причина: \`${reason}\`\n**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    },
    member.id,
    guild
  );
  return true;
};

module.exports = unmute;
