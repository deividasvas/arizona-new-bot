const setUserCoinsParam = require("../components/setUserCoinsParam");
const { getGuildChannelsId, coinsRates } = require("../configs/settings");
const CoinsUsers = require("../models/CoinsUsers");
const isCheck = new Set();

module.exports = {
  /*
    Описание модуля
    Проверка всех пользователей на нахождение на сервере определенное время. Выдает репутацию за это.
  */
  name: "reputation", // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  autoRun: true, // автоматический запуск модуля
  run: async ({bot, message}) => {
    setInterval(() => {
      const filterFunc = (member) => {
        const joinTimestamp = member.joinedAt + 864_000_000;
        return (new Date() - (new Date(joinTimestamp))) > 0
      }

      for(const [guildId, guild] of bot.guilds.cache){
        const filteredUsers = guild.members.cache.filter(filterFunc)

        filteredUsers.map(user => {
          const role = [...user.roles.cache].reduce((priorityRole, currentRole) => {
            priorityRole.position > currentRole.position ? priorityRole[0] : currentRole[0]
          })

          const reputationForHeadRole = coinsRates.rolesReputationGive().find(r => r.id === role.id).rep;

          setUserCoinsParam(user.id, guild.id, `reputation`, ({ reputation }) => {
            reputation + reputationForHeadRole
          })
        })
      }
    }, 86400000)
  },
};
