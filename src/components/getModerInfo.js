const Moderators = require("../models/Moderators");
const createModerInfo = require("./createModerInfo");
const getAllRolesIdModers = require("./getAllRolesIdModers");
const {getGuildRolesId} = require("../configs/settings");

// Функция запрашивает и отдаёт модерскую статистику.
const getModerInfo = async (bot, guildId, userId) => {
  // пытаемся получить статистику модератора, если её нет, то инициализируем нулевую.
  const moderator = await Moderators.findOne({
    userId,
    guildId,
  });

  const rolesId = getGuildRolesId(guildId);

  // Проверка на то, является ли человек модератором
  const guild = bot.guilds.cache.get(guildId || moderator.guildId);
  const member = guild.members.cache.get(userId) || await guild.members.fetch(userId);
  const allRolesIdModers = getAllRolesIdModers(rolesId);
  if (!member.roles.cache.some((role) => allRolesIdModers.includes(role.id)) && !moderator) {
    // проверяем является ли пользователь модератором, если нет, то кидаем ошибку.
    return {
      error: "THE_NOT_MODERATOR",
    };
  }

  if (!moderator) {
    await createModerInfo(userId, guildId); // если не найдено статистики модератора, то сохраняем новую.
    // Если модератора нет, то немного выше на 21 строке идёт создание новой статистики модератора
    // мы просто благодаря рекурсиям возвращаем так-же нового модератора без всяких заморочек
    return getModerInfo(bot, guildId, userId);
  }

  return moderator;
};

module.exports = getModerInfo;
