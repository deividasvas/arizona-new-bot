const {EmbedBuilder, Colors, AuditLogEvent} = require("discord.js");
const {channelsId} = require("../configs/settings")
const unbanFunc = require("../components/unban");

module.exports = (bot, unban) => {
    setTimeout(async () => {
        const logChannel = unban.guild.channels.cache.get(channelsId[unban.guild.id].rolesAndBans);
        const logs = await unban.guild.fetchAuditLogs({
            before: null,
            limit: 1,
            type: AuditLogEvent.MemberBanRemove
        })

        if (!logs) return;
        const unbanLog = logs.entries.find(e => e.target.id === unban.user.id)
        const reason = unbanLog.reason || "Не указана";
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