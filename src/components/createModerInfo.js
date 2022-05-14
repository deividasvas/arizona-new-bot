const Moderators = require("../models/Moderators");

// Функция создаёт в случае отсутствия модерскую информацию в коллекции
const createModerInfo = async (userId, guildId) => {
  // проверяем существует ли модератор уже

  if (
      await Moderators.findOne({
        userId,
        guildId,
      })
  ) {
    return; // если да, то просто ничего не делаем
  }

  await Moderators.insertMany([
    {
      // если нет, то создаём модератора
      userId, // Discord ID модератора
      guildId,
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
        removedRole: 0, // количество снятых ролей
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
        removedRole: 0, // количество выданных ролей
      },
      warns: [], // выговоры / преды
      task: { // задание на снятие предупреждения
        status: 'no', // active / no
        mutes: 0, // количество мутов для снятия предупреждения
        kicks: 0, // количество киков для снятия предупреждения
        bans: 0, // количество банов для снятия предупреждения
        tickets: 0, // количество тикетов для снятия предупреждения
      },
      neactive: { // неактив модератора.
        dateEnd: new Date(), // дата конца неактива
        givedId: "", // айди того кто выдал неактив
        active: false, // активен ли неактив
      }
    }
  ]); // сохраняем модератора в коллекцию
};

module.exports = createModerInfo;
