const {getGuildRolesId} = require("../configs/settings");
const Punishment = require("../models/Punishment");

// Функция снятия блокировки писать тикеты пользователю
const unSupportBlock = async (bot, guildId, userId, provocateur = "-", reason) => {
    const rolesId = getGuildRolesId(guildId);
    const punish = await Punishment.findOne({
        userId,
        guildId,
        action: "support-block",
    }); // получаем наказание блок саппорта пользователя из бд
    if (!punish) {
        return null; // если блока саппорта нет, то ничего не делаем
    }
    // блок саппорта есть, двигаемся дальше
    const guild = bot.guilds.cache.get(punish.guildId); // получаем сервер нарушителя
    const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId)); // получаем самого нарушителя которому нужно снять блок саппорта
    await member.roles.remove(rolesId.supportBlock); // удаляем роль `Support-Block`
    punish.remove(); // удаляем наказание из бд
    return true;
};

module.exports = unSupportBlock;
