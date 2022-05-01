const getActionName = (numAction) => {

    // Все действия.
    const actions = {
        1: "Kick",
        2: "Mute",
        3: "Mwarn",
        4: "Mban",
        5: "Mrebuke",
        6: "Set-stats",
        7: `Unban`,
        8: `Unmute`,
        9: `Unwarn`,
        10: `Unrebuke`,
        11: `Imun`,
        12: `ClearTickets`,
        13: `CreateRole`,
        14: `Fullobnul`,
        15: `Neactive`,
        16: `NickAdd`,
        17: `NickRemove`,
        18: `SupportBlock`,
        19: `SupportActive`,
        20: `SupportHold`,
        21: `SupportClose`,
        22: 'SupportAppraisalPlus',
        23: 'SupportAppraisalMinus',
        24: 'CreateFam',
        25: 'DeleteFam',
        26: 'FamAddZam',
        27: 'FamDelZam',
        28: 'FamInvite',
        29: `FamKick`,
        30: 'RequestAddRole',
        31: 'RequestRemoveRole',
        32: 'RequestNotSuccessRole',
        33: "BugSuccess",
        34: "BugNotSuccess",
        35: `BugDelete`,
        36: 'BshopMinusPred',
        37: 'BshopImun',
        38: 'Bshop10levelPlus',
        39: 'Bshopx2Balls',
        40: 'Bshopx3Balls',
        41: 'AddModerator',
        42: 'AddModerator'
    }

    // Возвращаем действие по числу
    return actions[Number(numAction)]
}

module.exports = getActionName;