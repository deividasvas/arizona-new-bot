const Moderators = require("../models/Moderators");
const createModerInfo = require("./createModerInfo");

const setModerInfoParam = async (
  userId,
  type,
  paramKey,
  paramValueOrFunction
) => {
  if (type !== "main" && type !== "week") {
    throw new Error(
      `В \`setModerInfoParam\` параметр \`type\` должен быть либо "main" либо "week".`
    );
  }
  if (
    !(await Moderators.findOne({
      discordId: userId,
    }))
  ) {
    // если модератора не существует в коллекции, то создаём его
    await createModerInfo(userId);
  }
  const moderator = await Moderators.findOne({
    discordId: userId,
  });
  const obj = JSON.parse(JSON.stringify(moderator[type])); // копируем объект чтоб удалить из него уже существующее значение
  delete obj[paramKey];

  await Moderators.updateOne(
    {
      discordId: userId,
    },
    {
      $set: {
        [type]: {
          ...obj,
          [paramKey]:
            typeof paramValueOrFunction === "function"
              ? await paramValueOrFunction({
                  ...moderator[type],
                  coefficient: moderator.main.coefficient,
                })
              : paramValueOrFunction, // paramValueOrFunction может быть либо функцией либо числом, если это фича, то проверяем это и в случае чего активируем, в результате должно прийти число. Если это не фича, то вставляем как фичу
        },
      },
    }
  ); // обновляем данные
  return true;
};

module.exports = setModerInfoParam;
