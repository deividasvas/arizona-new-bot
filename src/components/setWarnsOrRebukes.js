const Moderators = require("../models/Moderators");
const createModerInfo = require("./createModerInfo");

const setWarnsOrRebukes = async (userId, func) => {
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


  await Moderators.updateOne(
    {
      discordId: userId,
    },
    {
      $set: {
        warns: await func(moderator), // функция должна вернуть массив с всеми варнами и выговорами
      },
    }
  );

  return true;
};

module.exports = setWarnsOrRebukes;
