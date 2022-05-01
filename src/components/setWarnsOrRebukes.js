const Moderators = require("../models/Moderators");
const createModerInfo = require("./createModerInfo");

// Функция которая УСТАНАВЛИВАЕТ выговоры/предупреждения модератору
// func - функция которая принимает в себя объект всего модератора и должна возвращать массив со ВСЕМИ предами и выговорами 

const setWarnsOrRebukes = async (userId, guildId, func) => {
  if (
    !(await Moderators.findOne({
      userId,
      guildId,
    }))
  ) {
    // если модератора не существует в коллекции, то создаём его
    await createModerInfo(userId, guildId);
  }
  const moderator = await Moderators.findOne({
    userId,
    guildId,
  });


  await Moderators.updateOne(
    {
      discordId: userId,
      guildId,
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
