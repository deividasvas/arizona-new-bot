const { MessageEmbed } = require("discord.js");
const { logs } = require("../configs/settings")

module.exports = async(bot, banMember) => {
    return
    const logChannel = banMember.guild.channels.cache.get(logs.ban);

    if(!logChannel) return console.log('[Ошибка]: Канал для лога банов не был найден!')

    setTimeout(async () => {
        const logs = await banMember.guild.fetchAuditLogs({
            befor: null,
            limit: 1,
            type: 22
        })

        if(!logs) return;

        const banLog = logs.entries.find(e => e.target.id === banMember.user.id)

        if (new Date().getTime() - new Date((banLog.id / 4194304) + 1420070400000).getTime() > 3000) return;

        logChannel.send({
            embeds: [new MessageEmbed()
                .setAuthor({
                    name: `${banMember.user.tag}`,
                    iconURL: banMember.user.displayAvatarURL()
                })
                .setTimestamp()
                .setDescription(`**Забанил: ${banLog.executor ?? '\`Не известно\`'}\nПользователь: \`${banMember.user.tag} [${banMember.user.id}]\`\nПричина: ${banLog.reason ?? '\`Не указано\`'}**`)
                .setColor(`RED`)
                .setFooter({
                    text: `Robo Hamster`,
                    iconURL: bot.user.displayAvatarURL()
                })
            ]
        })
    }, 1000)
}