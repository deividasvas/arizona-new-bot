const kick = async (bot, guildId, userId, provocateur, reason) => {
  const guild = bot.guilds.cache.get(guildId);
  const member =
    guild.members.cache.get(userId) || (await guild.members.fetch(userId));
  member.kick(`${reason} by ${provocateur.user.tag}`);
};

module.exports = kick;
