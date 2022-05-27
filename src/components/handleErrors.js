const { EmbedBuilder, Colors } = require("discord.js");
// Функция обработки ошибок.
const handleErrors = (err, bot, { message, command, isCommandError = false, } = {}) => {
    console.log(err);
    console.log(err.stack);
    if(!bot?.guilds){
        return;
    }
    const errChannel = bot.guilds.cache.get('948675243025764404')?.channels.cache.get('948675243826888772');
    if (!errChannel) {
        console.log(err);
        return console.log(`[📝 | Ошибка бота]: Я не нашел канал для отправки сообщения об ошибке! Вот информация о ней\n` + err.stack)
    }
    if (!isCommandError) {
        return errChannel.send({
            content: `<@&948675243248062523>`,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${bot.user.username}・Ошибка`,
                        iconURL: bot.user.displayAvatarURL()
                    })
                    .setDescription(`**「💻」Тип ошибки: \`${err.name}\`**\n\n\`\`\`xl\n${err.stack}\`\`\``)
                    .setColor(Colors.Blue)
                    .setTimestamp()
            ]
        })
    }
    return errChannel.send({
        content: `<@&${rolesID.techSection}>`,
        embeds: [
            new EmbedBuilder()
                .setTitle(`😪 | Произошла ошибка!`)
                .setDescription(`**\n「📝」Канал: ${message.channel} \`[${message.channel.id}]\`\n「📌」Команда: \`${command.name}\`\n「💻」Тип ошибки: \`${err.name}\`**\n\n\`\`\`xl\n${err.stack}\`\`\``)
                .setColor(`#ff0022`)
                .setTimestamp()
                .setFooter({
                    text: `Robo Hamster`,
                    iconURL: message.bot.user.displayAvatarURL()
                })
        ]
    })
};

module.exports = handleErrors;