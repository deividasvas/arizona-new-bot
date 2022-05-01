/*
    Функция для создания профиля в коллекции `profiles`.
    Возвращает новый профиль
 */

const Profiles = require('../models/Profiles');

const createUserProfile = async (userId, guildId) => {
    const profile = await Profiles.findOne({
        userId,
        guildId
    });
    // Проверяем, есть ли у пользователя уже существующий профиль. Если да, то отдаём null
    if (profile){
        return null;
    }

    const newProfile = new Profiles({
        userId,
        guildId,
        IsUserCanUseCustomFontInNickname: false,
    });

    // Создаём новый профиль и сохраняем его в коллекции.
    await newProfile.save();
    return newProfile;
}

module.exports = createUserProfile;