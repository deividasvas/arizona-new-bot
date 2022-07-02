const Moderators = require('../models/Moderators');
const createModerInfo = require("./createModerInfo");
/*
    Функция для обновления задания для модератора для снятия предупреждения.
    Пример использования: updateModeratorTask("123", "321", { mutes: 12, kicks: 3, bans: 10, tickets: 20 });
 */
const updateModeratorTask = async (moderatorId, guildId, task = {
    mutes: 0,
    kicks: 0,
    bans: 0,
    tickets: 0,
    status: 'no'
}) => {
    if (
        !(await Moderators.findOne({
            userId: moderatorId,
            guildId,
        }))
    ) {
        // если модератора не существует в коллекции, то создаём его
        await createModerInfo(moderatorId, guildId);
    }
    const {mutes = 0, bans = 0, kicks = 0, tickets = 0} = task;
    const status = task.status || mutes === 0 && bans === 0 && kicks === 0 && tickets === 0 ? "no" : "active";
    await Moderators.updateOne({
        userId: moderatorId,
        guildId
    }, {
        $set: {
            task: {
                mutes,
                bans,
                kicks,
                tickets,
                status
            },
        }
    });
}

module.exports = updateModeratorTask;