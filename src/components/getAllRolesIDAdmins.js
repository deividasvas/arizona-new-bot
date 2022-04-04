const { rolesID } = require("../configs/settings");

const getAllRolesIDAdmins = () => {
  return [
      rolesID.mainAdmin, // ГА
      rolesID.deputyMainAdmin, // ЗГА 
      rolesID.curator, // Куратор
      rolesID.adminsFourLVL, // Админы 4 уровня
      rolesID.adminsThreeLVL, // Админы 3 уровня
      rolesID.juniorAdmins, // админы 1-2 уровня
    ]
};

module.exports = getAllRolesIDAdmins;
