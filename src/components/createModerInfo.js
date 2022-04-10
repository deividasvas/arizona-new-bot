const Moderators = require("../models/Moderators");

const createModerInfo = async (userId) => { // создёт в случае отсутствия модерскую информацию в коллекции
    // проверяем существует ли модератор уже
  if (
    await Moderators.findOne({
      userId,
    })
  ) {
      return; // если да, то просто ничего не делаем
  }

  const newModerator = new Moderators({ // если нет, то создаём модератора
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
  await newModerator.save(); // сохраняем модератора в коллекцию
};

module.exports = createModerInfo;
