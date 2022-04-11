const { rolesId } = require("../configs/settings");

const getAllRolesIdModers = () => {
  return [
    rolesId.discordMaster, // Discord Master
    rolesId.juniorAdmins, // Junior Discord Master
    rolesId.adviceAdministration, // Совет администрации DISCORD'a
    rolesId.curatorModeration, // Куратор модерации
    rolesId.moderator, // Модератор
    rolesId.juniorModerator, // Младшим модератор
  ];
};

module.exports = getAllRolesIdModers;
