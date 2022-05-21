const CoinsUsers = require("../models/CoinsUsers");
const getCoinsProfile = require("./getCoinsProfile");
const {coinsCoefficient, coinsRates} = require("../configs/settings");

// Функция изменения какого либо параметра в статистике пользователя в койнах.

const setUserCoinsParam = async (
    userId, // айди пользователя
    guildId, // айди сервера
    paramKey, // название параметра
    paramValueOrFunction // Значение параметра. Тут либо обычное значение, либо функция которая принимает в
) => {
    const profile = await getCoinsProfile(userId, guildId);
    const obj = JSON.parse(JSON.stringify(profile)); // копируем объект, чтоб удалить из него уже существующее значение
    delete obj[paramKey];
    const func = paramValueOrFunction;
    const value = typeof func === 'function' ? await func({
        coefficient: coinsCoefficient,
        rates: coinsRates,
        ...profile._doc,
    }) : func;

    await CoinsUsers.updateOne({
            guildId,
            userId,
        }, {
            $set: {
                ...obj,
                [paramKey]: value,
            },
        }
    ); // обновляем данные
    return true;
};

module.exports = setUserCoinsParam;
