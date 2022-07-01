const Punishment = require('../models/Punishment')
const { cancelJob } = require('node-schedule')
const log = require('../components/log');

// Функция разблокировки пользователя.
const unban = async (bot, guildId, userId, provocateur = '-', reason = 'Система снятия блокировки') => {
  const punish = await Punishment.findOne({
    action: 'ban',
    userId,
    guildId
  })
  const guild = bot.guilds.cache.get(guildId)
  const user = await bot.users.fetch(userId)
  // Если наказания нет в базе данных, и бана на сервере нет, то ничего не делаем
  if (!punish && !await guild.bans.fetch({
    user
  })) {
    return
  }

  await guild.bans.remove(userId, `${reason} by ${provocateur.displayName || provocateur.toString()}`)
  await Punishment.deleteOne({
    action: 'ban',
    userId,
    guildId
  })
  cancelJob(`${guildId}-${userId}-ban-${punish?.reason}`) // отменяем автоматическое снятие наказания через модуль punishment.js
}

module.exports = unban
