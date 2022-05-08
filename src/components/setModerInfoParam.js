const Moderators = require("../models/Moderators");
const createModerInfo = require("./createModerInfo");

// Функция изменения какого-то модерского параметра в статистике модератора.
// Пример: setModerInfoParam(123, "main", "bans", ({ bans, cofficient }) => 10 * cofficient)
// ДЛЯ ВЫГОВОРОВ ИСПОЛЬЗУЕТСЯ setWarnsOrRebukes.js
const setModerInfoParam = async (
  userId,
  guildId,
  type, // main - основная статистика / week - недельная статистика
  paramKey, // название параметра
  paramValueOrFunction // значение параметра. Тут либо обычное значение, либо функция которая принимает в 
  // себя основную/еженедельную статистику + иммунитеты + объект warns с выговорами и предами
) => {
  if (type !== "main" && type !== "week" && type !== "neactive") {
    throw new Error(`В \`setModerInfoParam\` параметр \`type\` должен быть либо "main" либо "week" либо "neactive".`);
  }
  if (!(await Moderators.findOne({
    userId, guildId,
  }))) {
    // если модератора не существует в коллекции, то создаём его
    await createModerInfo(userId, guildId);
  }
  const moderator = await Moderators.findOne({
    userId,
  });
  const obj = JSON.parse(JSON.stringify(moderator[type])); // копируем объект, чтоб удалить из него уже существующее значение
  delete obj[paramKey];

  await Moderators.updateOne({
        userId,
      }, {
        $set: {
          [type]: {
            ...obj, [paramKey]: typeof paramValueOrFunction === "function" ? await paramValueOrFunction({
              ...moderator[type], coefficient: moderator.main.coefficient, neactive: moderator.neactive
            }) : paramValueOrFunction, // paramValueOrFunction может быть либо функцией либо числом, если это фича, то проверяем это и в случае чего активируем, в результате должно прийти число. Если это не фича, то вставляем как фичу
          },
        },
    }
  ); // обновляем данные
  return true;
};

module.exports = setModerInfoParam;
