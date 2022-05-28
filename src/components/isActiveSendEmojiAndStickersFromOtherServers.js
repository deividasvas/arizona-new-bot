const convertDaysToMs = require('../components/convertDaysToMs')
const getCoinsProfile = require('../components/getCoinsProfile')
const setModerInfoParam = require('./setModerInfoParam')
const setUserCoinsParam = require('./setUserCoinsParam')
// Функция проверяет активна ли у пользователя возможность отправлять эмодзи и стикеры с других серверов.
const isActiveSendEmojiAndStickersFromOtherServers = async (userId, guildId) => {
  const { sendEmojiAndStickersFromOtherServers } = await getCoinsProfile(userId, guildId);
  // Если никаких данных нет, то возвращаем что неактивна.
  if (!sendEmojiAndStickersFromOtherServers) {
    return false
  }

  // Если количество дней которых будет активна возможность больше одного или ровняется одному, то возвращаем что неактивна
  if ((
    new Date(sendEmojiAndStickersFromOtherServers.dateEnd) - new Date()
  ) >= convertDaysToMs(1)) {
    return true
  } else {
    // Если количество дней меньше 1, то устанавливаем что нет никаких данных и возвращаем что неактивна.
    await setUserCoinsParam(userId, guildId, `sendEmojiAndStickersFromOtherServers`, null)
    return false
  }
}

module.exports = isActiveSendEmojiAndStickersFromOtherServers;