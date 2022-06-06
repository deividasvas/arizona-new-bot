const LogDataBase = require('../models/LogDataBase');

// Функция возвращает имя действия по айди.
const getActionNameById = (numAction) => {
  if (numAction == 0) {
    return `Неопределенное (${numAction})`;
  } 
  // Moderations
  if (numAction == 1) return 'Kick'
  if (numAction == 2) return 'Mute'
  if (numAction == 3) return 'Mwarn'
  if (numAction == 4) return 'Mban'
  if (numAction == 5) return 'Mrebuke'
  if (numAction == 6) return 'Set-stats'
  if (numAction == 7) return 'Unban'
  if (numAction == 8) return 'Unmute'
  if (numAction == 9) return 'Unpred'
  if (numAction == 10) return 'Unwarn'
  if (numAction == 11) return 'Imun'
  if (numAction == 12) return 'ClearTickets'
  if (numAction == 13) return 'CreateRole'
  if (numAction == 14) return 'FullObnul'
  if (numAction == 15) return 'Neactive'
  if (numAction == 16) return 'NickAdd'
  if (numAction == 17) return 'NickRemove'
  // Support
  if (numAction == 18) return 'SupportBlock'
  if (numAction == 19) return 'SupportActive'
  if (numAction == 20) return 'SupportHold'
  if (numAction == 21) return 'SupportClose'
  if (numAction == 22) return 'SupportAppraisalPlus'
  if (numAction == 23) return 'SupportAppraisalMinus'
  // Family
  if (numAction == 24) return 'CreateFam'
  if (numAction == 25) return 'DeleteFam'
  if (numAction == 26) return 'FamAddZam'
  if (numAction == 27) return 'FamDelZam'
  if (numAction == 28) return 'FamInvite'
  if (numAction == 29) return 'FamKick'
  // Request-For-Roles
  if (numAction == 30) return 'RequestAddRole'
  if (numAction == 31) return 'RequestRemoveRole'
  if (numAction == 32) return 'RequestNotSuccessRole'
  // Bug Report
  if (numAction == 33) return 'BugSuccess'
  if (numAction == 34) return 'BugNotSuccess'
  if (numAction == 35) return 'BugDelete'
  // Bshop
  if (numAction == 36) return 'BshopMinusPred'
  if (numAction == 37) return 'BshopImun'
  if (numAction == 38) return 'Bshop10levelPlus'
  if (numAction == 39) return 'Bshopx2Balls'
  if (numAction == 40) return 'Bshopx3Balls'
  // Moderation
  if (numAction == 41) return 'AdModerator'
  if (numAction == 42) return 'UnModerator'
  // Private
  if (numAction == 43) return 'CreatePrivate'
  if (numAction == 44) return 'DeletePrivate'
}

// Функция для логирования действий
const log = async (actionId, options) => {
  const actionName = getActionNameById(actionId);
  const logAct = new LogDataBase({
    ...options,
    time: new Date(),
    actionName,
    actionId,
  });
  await logAct.save();
}

module.exports = log;