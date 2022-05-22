const CoinsUsers = require('../models/CoinsUsers');

const createCoinsProfile = async (userId, guildId) => {
    const profile = new CoinsUsers({
        dateCreate: new Date(),
        userId,
        guildId,
        coins: 0,
        IsUserCanUseCustomFontInNickname: false,
        platforms: 0,
        lastDateTransfer: new Date(),
        paidOfDay: 0,
        promocode: {
            name: "",
            dateActivate: new Date(),
            activate: false,
        },
        depositCoins: 0,
        isDepositActive: false,
    })
    await profile.save();
}

module.exports = createCoinsProfile;