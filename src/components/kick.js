const LogDataBase = require('../models/LogDataBase');

// Функция кикает с сервера.
const kick = async (bot, guildId, userId, provocateur, reason) => {
    const guild = bot.guilds.cache.get(guildId);
    const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));
    member.kick(`${reason} by ${provocateur.user.tag}`);

  new LogDataBase({
    guildId, // ID сервера
    discordId: userId, // ID упомянутого участника
    discordTag: member.tag, // Tag упомянутого участника
    discordNick: member.displayName, // Серверный ник упомянутого участника
    moderatorId: provocateur.id, // ID автора сообщения
    moderatorTag: provocateur.tag, // Tag автора сообщения
    moderatorNick: provocateur.displayName, // Серверный ник автора сообщения
    action: 1, // Номер действия
    time: new Date(), // Время выдачи наказания
    reason, // Причина
  }).save(); // Сохраняем кик в базу данных
};

module.exports = kick;
