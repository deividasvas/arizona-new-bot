const { rolesId } = require("../configs/settings");

const getAllRolesIdAdmins = () => {
  return [
    rolesId.mainAdmin, // ГА
    rolesId.deputyMainAdmin, // ЗГА
    rolesId.curator, // Куратор
    rolesId.adminsFourLVL, // Админы 4 уровня
    rolesId.adminsThreeLVL, // Админы 3 уровня
    rolesId.juniorAdmins, // админы 1-2 уровня
  ];
};

module.exports = getAllRolesIdAdmins;
