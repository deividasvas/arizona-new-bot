const Families = require("../models/Families");

// Функция отдаёт все айдишники фам ролей
const getAllRolesIdFamilies = async () => {
    const families = await Families.find(); // получаем все семьи
    return families.map(family => family.roleId);
}

module.exports = getAllRolesIdFamilies;