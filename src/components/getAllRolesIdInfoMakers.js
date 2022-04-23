const { rolesId } = require("../configs/settings");

// Функция отдаёт все айдишники инфомейкерских ролей
const getAllRolesIdInfoMakers = () => {
  return [
    rolesId.discordMaster, // Discord Master
    rolesId.juniorAdmins, // Junior Discord Master
    rolesId.chiefInfoMaker,
    rolesId.infoMaker, // Infomaker
  ];
};

module.exports = getAllRolesIdInfoMakers;
