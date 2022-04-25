const Moderators = require("../models/Moderators");
const createModerInfo = require("./createModerInfo");
const getAllRolesIdModers = require("./getAllRolesIdModers");

// Функция запрашивает и отдаёт модерскую статистику.
const getModerInfo = async (bot, guildId, userId) => {
  // пытаемся получить статистику модератора, если её нет, то инициализируем нулевую.
  const moderator = await Moderators.findOne({
    discordId: userId
  });

  if (!moderator) {
    await createModerInfo(userId, guildId); // если не найдено статистики модератора, то сохраняем новую.
    // Если модератора нет, то немного выше на 21 строке идёт создание новой статистики модератора
    // мы просто благодаря рекурсиям возвращаем так-же нового модератора без всяких заморочек
    return getModerInfo(bot, guildId, userId);
  }

  // || сделана для того, чтобы можно было в случае чего понять является ли человек модератором
  // даже если он к примеру нажал на кнопку в личных сообщениях у бота.
  const guild = bot.guilds.cache.get(guildId || moderator.guildId);
  const member = guild.members.cache.get(userId);
  const allRolesIDModers = getAllRolesIDModers();
  if (!member.roles.cache.some((role) => allRolesIDModers.includes(role.id))) {
    // проверяем является ли пользователь модератором, если нет, то кидаем ошибку.
    return {
      error: "THE_NOT_MODERATOR",
    };
  }

  return moderator;
};

module.exports = getModerInfo;
