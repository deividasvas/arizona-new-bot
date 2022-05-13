const {channelsId, categories, messagesIgnoredChannelsId, messagesIgnoredCategoriesId} = require("../configs/settings");
const {EmbedBuilder, Colors} = require("discord.js");

// Функция, которая превращает строку в чанк
function chunked(toChunk) {
    const lenChunks = Math.ceil(toChunk.length / 1000)
    const chunksToReturn = []
    for (let i = 0; i < lenChunks; i++) {
        const chunkedStr = toChunk.substring((1000 * i), i === 0 ? 1000 : 1000 * (i + 1))
        chunksToReturn.push(chunkedStr)
    }
    return chunksToReturn
}
const log = async (bot, message) => {
    if (message.channel.type === "DM") return;
    // Если автор сообщения бот, то ничего не делаем
    if (message.author.bot) {
        return;
    }

    // Айдишники каналов сервера
    const guildChannelsId = channelsId[message.guild.id];
    const guildCategoriesId = categories[message.guild.id];

    // Канал куда всё логируется
    const channelLog = bot.channels.cache.get(guildChannelsId.messagesLog);

    // Игнорируемые каналы
    const ignoredChannelsId = messagesIgnoredChannelsId(guildChannelsId);

    const ignoredCategoriesId = messagesIgnoredCategoriesId(guildCategoriesId);

    // Если категория находиться в игнорируемых или канал находиться в игнорируемых, то пропускаем.
    if (ignoredCategoriesId.includes(message.channel.parentId) || ignoredChannelsId.includes(message.channel.id)) {
        return null;
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.DarkGreen)
        .setTimestamp()
        .setDescription(`${message.author} (${message.author.id}) удалил сообщение в канале ${message.channel} (${message.channel.id})`)
        .setAuthor({
            name: `${message.member.user.tag} ${message.member.user.username ? `(${message.member.user.username})` : ''}`,
            iconURL: message.member.user.displayAvatarURL({size: 2048, dynamic: true, format: 'png'}),
        })
        .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
        });

    // Если сообщение более 2000 символов, то разделяем сообщение и засовываем части в field'ы
    let messageChunks = []
    if (message.content) {
        if (message.content.length > 1000) {
            messageChunks = chunked(message.content.replace(/\"/g, '"').replace(/`/g, ''))
        } else {
            messageChunks.push(message.content)
        }
    } else {
        messageChunks.push(`Отсутствует`)
    }
    messageChunks.forEach((chunk, i) => {
        embed.addFields([
            {
                name: i === 0 ? `Контент` : `Продолжение`,
                value: chunk,
            }
        ])
    })

    // Вставляем картинку если она имеется
    let image = []
    if (message.attachments.size !== 0) {
        message.attachments.forEach((attachment) => {
            image.push(attachment)
        })
        embed.setImage(image[0].proxyURL)
    }
    embed.addFields([{
        name: `Ссылки на изображение`,
        value: `${image.length === 0 ? `Отсутствует` : image.map(m => m.proxyURL).join('\n')}`,
    }])
    // Вставляем стикеры если они имеются.
    let stick = []
    if (message.stickers.size !== 0) {
        message.stickers.forEach((sticker) => {
            stick.push(sticker)
        })
    }
    embed.addFields([{
        name: `Ссылка на стикер`,
        value: `${stick.length === 0 ? 'Отсутствует' : stick.map(m => m.url).join('\n')}`,
    }])
    // Вставляем информацию об сообщений и участнике
    embed.addFields([{
        name: `Информация`,
        value: `**Участник:** ${message.author} (${message.author.id})\n**Сообщение:** ${message.id}`,
    }]);
    // Отправляем лог в канал
    await channelLog.send({embeds: [embed]});
}

module.exports = async (bot, message) => {
    await log(bot, message);
};