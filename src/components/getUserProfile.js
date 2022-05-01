/*
    Функция возвращает профиль пользователя из коллекции `profiles`.
 */
const Profiles = require('../models/Profiles');
const createUserProfile = require("./createUserProfile");

const getUserProfile = async (userId, guildId) => {
    const profile = await Profiles.findOne({
        userId,
        guildId
    });
    // Проверяем, существует ли профиль такого игрока.
    // Если нет, то создаём новый.
    if(!profile){
        // Создаём новый профиль и отдаём сразу же его.
        return await createUserProfile(userId, guildId);
    }
    // Если существует, то просто отдаём существующий.
    return profile;
}

module.exports = getUserProfile;