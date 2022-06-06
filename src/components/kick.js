const setModerInfoParam = require("./setModerInfoParam");
const settings = require("../configs/settings");
const getModerInfo = require("./getModerInfo");
const updateModeratorTask = require("./updateModeratorTask");
const log = require('./log');

// Функция кикает с сервера.
const kick = async (bot, guildId, userId, provocateurId, reason) => {
    const guild = bot.guilds.cache.get(guildId);
    const provocateur = guild.members.cache.get(provocateurId);
    const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));
    member.kick(`${reason} by ${provocateur.user.tag}`);

    // Логируем кик в базу данных.
    log(1, {
        guildId: guild.id, // ID сервера
        discordId: userId, // ID упомянутого участника
        discordTag: member.user.tag, // Tag упомянутого участника
        discordNick: member.displayName, // Серверный ник упомянутого участника
        moderatorId: provocateurId, // ID автора сообщения
        moderatorTag: provocateur.user.tag, // Tag автора сообщения
        moderatorNick: provocateur.displayName, // Серверный ник автора сообщения
        reason,
    });
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
        ({balls, coefficient, rates}) => balls + rates.kick * coefficient
    );
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "week",
        "balls",
        ({balls, coefficient, rates}) => balls + rates.kick * coefficient
    );
};

module.exports = kick;
