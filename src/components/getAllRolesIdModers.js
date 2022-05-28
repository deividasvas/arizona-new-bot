// Функция отдаёт все айдишники модерских ролей
const getAllRolesIdModers = (rolesId) => {
  return [
    rolesId.discordMaster, // Discord Master
    rolesId.juniorDiscordMaster, // Junior Discord Master
    rolesId.adviceAdministration, // Совет администрации DISCORD'a
    rolesId.curatorModeration, // Куратор модерации
    rolesId.moderator, // Модератор
    rolesId.juniorModerator, // Младшим модератор
  ];
};

module.exports = getAllRolesIdModers;
