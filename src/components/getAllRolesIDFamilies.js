const getAllRolesIDFamilies = async (bot) => {
    const families = await bot.connection(`SELECT * FROM \`families\` `);
    return families.map(family => family.role_id);
}

module.exports = getAllRolesIDFamilies;