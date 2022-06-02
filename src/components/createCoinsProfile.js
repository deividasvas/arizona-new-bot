const CoinsUsers = require('../models/CoinsUsers');

const createCoinsProfile = async (userId, guildId) => {
    const profile = new CoinsUsers({
        dateCreate: new Date(),
        userId,
        guildId,
        coins: 0,
        isActiveCustomFontInNickname: false,
        sendEmojiAndStickersFromOtherServers: null,
        platforms: 0,
        lastDateTransfer: null,
        paidOfDay: 0,
        promocode: null,
        depositCoins: 0,
        isDepositActive: false,
        lastDateDayDepositInteraction: null,
        lastDateWeekDepositInteraction: null,
        lastDateDayRefillDeposit: null,
        userPass: null
    })
    await profile.save();
}

module.exports = createCoinsProfile;