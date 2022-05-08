const LogDataBase = require('../models/LogDataBase');
const setModerInfoParam = require("../components/setModerInfoParam");
const settings = require("../configs/settings");
const getModerInfo = require("./getModerInfo");
const updateModeratorTask = require("./updateModeratorTask");

// Функция кикает с сервера.
const kick = async (bot, guildId, userId, provocateurId, reason) => {
    const guild = bot.guilds.cache.get(guildId);
    const provocateur = guild.members.cache.get(provocateurId);
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
    // выдаем недельные муты и общие

    const {task} = await getModerInfo(bot, guildId, provocateurId);
    // Обновляем модератору задание если у него оно активно
    if (task.status === 'active') {
        await updateModeratorTask(provocateurId, guildId, {
            ...task,
            // если отнять от текущего состояния наказание, то проверяем будет ли ноль или меньше
            // если будет, то пишем ноль, если нет, то общее кол-во наказаний минус один
            kicks: task.kicks - 1 <= 0 ? 0 : task.kicks - 1
        })
    }

    await setModerInfoParam(
        provocateur.id,
        guildId,
        "main",
        "kicks",
        ({kicks}) => kicks + 1
    );
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "week",
        "kicks",
        ({kicks}) => kicks + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "main",
        "balls",
        ({balls, coefficient}) => balls + settings.rates.kick * coefficient
    );
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "week",
        "balls",
        ({balls, coefficient}) => balls + settings.rates.kick * coefficient
    );
};

module.exports = kick;
