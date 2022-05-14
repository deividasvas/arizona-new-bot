// Функция возвращает информацию по игроку при помощи никнейма.
const axios = require('axios');
const getPlayerGameInfo = async (nickname) => {
    const request = await axios.get(`https://arizona-rp-api.herokuapp.com/api/find-player?nickname=${nickname}`, {
        headers: {
            token: `ArizonaSurprise10TopTheBotWrittingByDeividBrown`,
        },
        validateStatus: () => true,
    })
    return request.data.statusCode === 0 ? request.data.data : null;
}

module.exports = getPlayerGameInfo;