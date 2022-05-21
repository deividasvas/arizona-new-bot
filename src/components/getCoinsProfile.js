const CoinsUsers = require('../models/CoinsUsers');
const createCoinsProfile = require("./createCoinsProfile");

/*
    Функция возвращает профиль с информацией из коллекции `coins`
 */
const getCoinsProfile = async (userId, guildId) => {
    const profile = await CoinsUsers.findOne({
        userId,
        guildId
    });
    if(!profile){
        await createCoinsProfile(userId, guildId);
        return getCoinsProfile(userId, guildId);
    }
    return profile;
}

module.exports = getCoinsProfile;