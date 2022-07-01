const { getGuildRolesId } = require('../configs/settings');
// Этот пользователь может редактировать параметры сервера. (Под параметрами подразумеваются роли, каналы).
// Сделано чтобы антислив не снимал роли.

const isUserAllowEditServer = (member) => {
  if(!member) return false;

  const rolesId = getGuildRolesId(member.guild.id);
  const allowRolesEditServer = [
      rolesId.mainAdmin,
      rolesId.deputyMainAdmin,
      rolesId.curator,
      rolesId.discordMaster,
      rolesId.juniorDiscordMaster,
  ]

  return member.permissions.has('Administrator') || member.user.bot || member.roles.cache.some(role => allowRolesEditServer.includes(role.id))
}

module.exports = isUserAllowEditServer;