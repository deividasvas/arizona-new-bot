const { MessageEmbed } = require("discord.js");
const { logs } = require("../configs/settings")

module.exports = async(bot, unban) => {
    // const logChannel = unban.guild.channels.cache.get(logs.ban);

    // if(!logChannel) return console.log('[Ошибка]: Канал для лога разбанов не был найден!')

    // setTimeout(async () => {
    //     const logs = await unban.guild.fetchAuditLogs({
    //         befor: null,
    //         limit: 1,
    //         type: 22
    //     })

    //     if(!logs) return;

    //     const banLog = logs.entries.find(e => e.target.id === unban.user.id)

    //     if (new Date().getTime() - new Date((banLog.id / 4194304) + 1420070400000).getTime() > 3000) return;

    //     logChannel.send({
    //         embeds: [new MessageEmbed()
    //             .setAuthor({
    //                 name: `${unban.user.tag}`,
    //                 iconURL: unban.user.displayAvatarURL()
    //             })
    //             .setTimestamp()
    //             .setDescription(`**Разбанил: ${banLog.executor ?? '\`Не известно\`'}\nПользователь: \`${unban.user.tag} [${unban.user.id}]\`**`)
    //             .setColor(`GREEN`)
    //             .setFooter({
    //                 text: `Robo Hamster`,
    //                 iconURL: bot.user.displayAvatarURL()
    //             })
    //         ]
    //     })
    // }, 1000)
}