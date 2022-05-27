const {channelsId, categories, messagesIgnoredCategoriesId, messagesIgnoredChannelsId} = require("../configs/settings");
const {EmbedBuilder, Colors} = require("discord.js");
const log = async (bot, oldMessage, newMessage) => {
    // Если автор сообщения бот, то ничего не делаем
    if (oldMessage.author.bot) {
        return;
    }
    // Айдишники каналов сервера
    const guildChannelsId = channelsId[oldMessage.guild.id];
    const guildCategoriesId = categories[oldMessage.guild.id];

    // Канал куда всё логируется
    const channelLog = bot.channels.cache.get(guildChannelsId.messagesLog);

    // Игнорируемые каналы
    const ignoredChannelsId = messagesIgnoredChannelsId(guildChannelsId);

    const ignoredCategoriesId = messagesIgnoredCategoriesId(guildCategoriesId);

    // Если категория находиться в игнорируемых или канал находиться в игнорируемых, то пропускаем.
    if (ignoredCategoriesId.includes(oldMessage.channel.parentId) || ignoredChannelsId.includes(oldMessage.channel.id)) {
        return null;
    }
    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setDescription(`${oldMessage.author} (${oldMessage.author.id}) обновил сообщение в канале ${oldMessage.channel} (${oldMessage.channel.id})`)
        .setTimestamp()
        .setAuthor({
            name: `${newMessage.member.user.tag} ${newMessage.member.user.username ? `(${newMessage.member.user.username})` : ''}`,
            iconURL: newMessage.member.user.displayAvatarURL({size: 2048, dynamic: true, format: 'png'}),
        })
        .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
        });

    // Проверяем есть ли изображения в сообщений. Если да, то добавляем их в эмбед.
    let image = []
    if (oldMessage.attachments.size !== 0) {
        oldMessage.attachments.forEach((attachment) => {
            image.push(attachment)
        })
        embed.addFields([
            {
                name: `Ссылки на изображение`,
                value: image.map(m => m.proxyURL).join('\n')
            }
        ]);
        embed.setImage(image[0].proxyURL)
    }
    // Если сообщение более 2000 символов, то разделяем его на части и вставляем в эмбед
    let nowChunks = []
    let beforeChunks = []
    if (newMessage.content) {
        if (newMessage.content.length > 1000) {
            nowChunks.push(newMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(0, 1000))
            nowChunks.push(newMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(1001, newMessage.content.length))
        } else {
            nowChunks.push(newMessage.content)
        }
    } else {
        nowChunks.push(`Отсутствует`)
    }
    if (oldMessage.content) {
        if (oldMessage.content.length > 1000) {
            beforeChunks.push(oldMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(0, 1000))
            beforeChunks.push(oldMessage.content.replace(/\"/g, '"').replace(/`/g, '').substring(1001, oldMessage.content.length))
        } else {
            beforeChunks.push(oldMessage.content)
        }
    } else {
        beforeChunks.push(`Отсутствует`)
    }
    nowChunks.forEach((chunk, i) => {
        embed.addFields([
            {
                name: i === 0 ? `Новое сообщение` : `Продолжение нового сообщения`,
                value: chunk
            }
        ])
    })
    beforeChunks.forEach((chunk, i) => {
        embed.addFields([
            {
                name: i === 0 ? `Старое сообщение` : `Продолжение старого сообщения`,
                value: chunk
            }
        ])
    })
    // Добавляем информацию об сообщений
    embed.addFields([{
        name: `Информация`,
        value: `**Участник:** ${newMessage.member} (${newMessage.member.id})\n**Сообщение:** ${newMessage.id}\n**Канал: <#${newMessage.channel.id}> (${newMessage.channel.name})\n[Перейти к сообщению](https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})**`
    }])
    await channelLog.send({embeds: [embed]});
}

module.exports = async (bot, oldMessage, newMessage) => {
    await log(bot, oldMessage, newMessage);
};