const Families = require("../models/Families");

const getAllRolesIdFamilies = async (bot) => {
    const families = await Families.find(); // получаем все семьи
    return families.map(family => family.roleId);
}

module.exports = getAllRolesIdFamilies;