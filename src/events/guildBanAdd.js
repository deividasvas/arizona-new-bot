const {MessageEmbed, Colors, EmbedBuilder} = require("discord.js");
const {logs, channelsId} = require("../configs/settings")
const ban = require("../components/ban");

module.exports = async(bot, banMember) => {
    setTimeout(async () => {
        const logs = await banMember.guild.fetchAuditLogs({
            before: null,
            limit: 1,
            type: 22
        })

        if(!logs) return;

        const banLog = logs.entries.find(e => e.target.id === banMember.user.id)
        if (new Date().getTime() - new Date((banLog.id / 4194304) + 1420070400000).getTime() > 3000) return;
        await ban(bot, banMember.guild.id, banLog.target.id, banLog.executor.id, 60, banLog.reason || "Блокировка через ПКМ");
        const bansLogsChannel = banMember.guild.channels.cache.get(
            channelsId[banMember.guild.id].rolesAndBans
        ); // канал куда отправляются логи банов
        await bansLogsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Система блокировки через ПКМ!`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: banMember.guild.name,
                        iconURL: banMember.guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Заблокировал: <@${banLog.executor.id}>\n「📌」Кого: <@${banLog.target.id}>\n「📅」Дней Бана: \`${60}\`\n「📕」Причина: \`${banLog.reason || "Не указана"}\`**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
    }, 1000)
}