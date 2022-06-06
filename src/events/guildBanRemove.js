const {EmbedBuilder, Colors, AuditLogEvent} = require("discord.js");
const {getGuildChannelsId} = require("../configs/settings")
const unbanFunc = require("../components/unban");

module.exports = (bot, unban) => {
    const { guild } = unban;
    const channelsId = getGuildChannelsId(guild.id)
    setTimeout(async () => {
        const logChannel = guild.channels.cache.get(channelsId.rolesAndBans);
        const logs = await  guild.fetchAuditLogs({
            before: null,
            limit: 1,
            type: AuditLogEvent.MemberBanRemove
        })

        if (!logs) return;
        const unbanLog = logs.entries.find(e => e.target.id === unban.user.id)
        const executorMember = guild.members.cache.get(unbanLog.executor.id);
        // Если снял бан бот, то ничего не делаем.
        if(executorMember.user.bot){
            return;
        }

        const reason = unbanLog?.reason || "Не указана";
        unbanFunc(bot, unban.guild.id, unbanLog.target.id, unbanLog.executor.id, reason)
            .catch(() => {
            });
        await logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Система снятия блокировки через ПКМ!`)
                    .setAuthor({
                        name: unban.guild.name,
                        iconURL: unban.guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Снял: ${unbanLog.executor} (${unbanLog.executor.id})\n「📌」Кому: ${unbanLog.target} (${unbanLog.target.id})\n 「📕」Причина: \`${reason}\`\n**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
    }, 5000);
}