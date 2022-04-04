const getAllRolesIDModers = require("./getAllRolesIDModers");

const getBazeModerInfoObject = (discord_id) => ({
  discord_id, // ID модератора
  roles: 0, // Сколько снято ролей в общем
  tickets: 0, // Количество тикетов на которое ответил модер
  bans: 0, // Количество банов которое выдал модер
  kicks: 0, // Количество киков которые выдал модер
  mutes: 0, // Количество мутов которые выдал модер
  goodAnswers: 0, // Количество тикетов с положительной оценкой
  toxicAnswers: 0, // Количество тикетов с отрицательной оценкой
  coefficient: 0, // Коофицент умножения баллов наказаний.
  balls: 0, // Общее количество баллов модератора
  userNotInDataBase: true, // Свойство показывающее что объект создан из функции а не взят из базы данных.
});

const getModerInfo = async (bot, guild, userID) => {
  const member = guild.members.cache.get(userID);
  const allRolesIDModers = getAllRolesIDModers();
  if (!member.roles.cache.some((role) => allRolesIDModers.includes(role.id))) {
    // проверяем является ли пользователь модератором, если нет, то кидаем ошибку.
    return {
      error: "THE_NOT_MODERATOR",
    };
  }
  const moderInfoMain = (
    await bot.connection(
      `SELECT * FROM \`moderation\` WHERE \`discord_id\` = "${userID}" `
    )
  )[0] || getBazeModerInfoObject(userID); // Общее количество баллов за всё время.
  if (moderInfoMain.userNotInDataBase) {
    // данного пользователя нет в базе данных, нужно создать его
    bot.connection(
      `INSERT INTO \`moderation\`(\`discord_id\`, \`roles\`, \`tickets\`, \`bans\`, \`kicks\`, \`mutes\`, \`goodAnswers\`, \`toxicAnswers\`, \`coefficient\`, \`balls\`) VALUES ("${userID}", 0, 0, 0, 0, 0, 0, 0, 0, 0)`
    );
  }
  const moderInfoWeek = (
    await bot.connection(
      `SELECT * FROM \`moderation_week\` WHERE \`discord_id\` = "${userID}" `
    )
  )[0] || getBazeModerInfoObject(userID); // Общее количество баллов за всё время.};
  if (moderInfoWeek.userNotInDataBase) {
    // данного пользователя нет в базе данных, нужно создать его
    bot.connection(
      `INSERT INTO \`moderation_week\`(\`discord_id\`, \`roles\`, \`tickets\`, \`bans\`, \`kicks\`, \`mutes\`, \`goodAnswers\`, \`toxicAnswers\`, \`coefficient\`, \`balls\`) VALUES ("${userID}", 0, 0, 0, 0, 0, 0, 0, 0, 0)`
    );
  }

  return {
      main: moderInfoMain,
      week: moderInfoWeek,
  }
}

module.exports = getModerInfo;


