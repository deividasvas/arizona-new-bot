const Moderators = require("../models/Moderators");
const getAllRolesIDModers = require("./getAllRolesIDModers");

const getModerInfo = async (bot, guildId, userId) => {
  const guild = bot.guilds.cache.get(guildId);
  const member = guild.members.cache.get(userId);
  const allRolesIDModers = getAllRolesIDModers();
  if (!member.roles.cache.some((role) => allRolesIDModers.includes(role.id))) {
    // проверяем является ли пользователь модератором, если нет, то кидаем ошибку.
    return {
      error: "THE_NOT_MODERATOR",
    };
  }

  // пытаемся получить статистику модератора, если её нет, то инициализируем нулевую.
  const moderator =
    (await Moderators.findOne({
      discordId: userId,
    })) ||
    new Moderators({
      discordId: userId, // Discord ID модератора
      main: {
        // общая информация по выданным наказаниям модератора
        roles: 0, // роли
        tickets: 0, // тикеты
        kicks: 0, // кики
        bans: 0, // баны
        mutes: 0, // муты
        goodAnswers: 0, // хорошие оценки за тикеты
        toxicAnswers: 0, // плохие оценки за тикеты
        balls: 0, // баллы
        coefficient: 1, // коэффицент Xn баллов.
        immunities: 0, // количество иммунитетов модератора
      },
      week: {
        // недельная информация по выданным наказания модератора
        roles: 0,
        tickets: 0, // тикеты
        kicks: 0, // кики
        bans: 0, // баны
        mutes: 0, // муты
        goodAnswers: 0, // хорошие оценки за тикеты
        toxicAnswers: 0, // плохие оценки за тикеты
        balls: 0, // баллы
      },
      warns: [], // выговоры / преды
    });

  if(!await Moderators.findOne({ discordId: userId })){
    moderator.save(); // если не найдено статистики модератора, то сохраняем новую.
  }

  return moderator;
};

module.exports = getModerInfo;
