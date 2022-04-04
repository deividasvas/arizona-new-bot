const { rolesID } = require("../configs/settings");

const getAllRolesIDModers = () => {
  return [
      rolesID.discordMaster, // Discord Master
      rolesID.juniorAdmins, // Junior Discord Master
      rolesID.adviceAdministration, // Совет администрации DISCORD'a
      rolesID.curatorModeration, // Куратор модерации
      rolesID.moderator, // Модератор
      rolesID.juniorModerator, // Младшим модератор
    ]
};

module.exports = getAllRolesIDModers;
