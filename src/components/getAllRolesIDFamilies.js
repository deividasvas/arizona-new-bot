const Families = require("../models/Families");

const getAllRolesIDFamilies = async (bot) => {
    const families = await Families.find(); // получаем все семьи
    return families.map(family => family.role_id);
}

module.exports = getAllRolesIDFamilies;