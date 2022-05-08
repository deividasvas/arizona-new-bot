const {channelsId, rolesId, categories} = require("../configs/settings");
const {ChannelType, EmbedBuilder, Colors} = require('discord.js');
const sendUserMessage = require("../components/sendUserMessage");

// Функция создания привата.
const createPrivate = async (member, name) => {
    // Категория в которой создаются приваты
    const privateParentCategory = member.guild.channels.cache.get(categories[member.guild.id].privatesBlock);

    // Новый канал который и будет приватом.
    const privateChannel = await member.guild.channels.create(`👥 | ${name}`, {
        type: ChannelType.GuildVoice, permissionOverwrites: [{
            id: member.id, allow: ['ViewChannel', 'Connect', 'Speak'], deny: ['Administrator']
        }, {
            id: rolesId[member.guild.id].juniorDiscordMaster,
            allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels',],
            deny: ['Administrator']
        }, {
            id: member.guild.id,
            allow: ['ViewChannel', 'Connect', 'Speak'],
            deny: ['Administrator', 'MuteMembers', 'MoveMembers', 'ManageChannels', 'DeafenMembers']

        }], parent: privateParentCategory.id, reason: `Создан канал для приватных комнат | ${name}`
    })
    // Устанавливаем изначальный лимит пользователей до 2.
    await privateChannel.setUserLimit(2);
    // Переносим создателя привата в новый канал.
    await member.voice.setChannel(privateChannel.id).catch(() => {
        // если произойдёт ошибка, то удаляем приват.
        privateChannel.delete();
    });

    await sendUserMessage({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.DarkBlue)
                .setDescription(`Вы создали приватный канал, вы можете изменить его как вам удобно через канал <#${channelsId[member.guild.id].managePrivate}>!`)
                .setTitle(`👥 | Приват комната успешно создана!`)
        ]
    }, member.id, member.guild);

    return privateChannel;
}

// Функция удаления привата.
const deletePrivate = async (guild, channelId) => {
    // Приват который будем удалять.
    const channel = guild.channels.cache.get(channelId);
    // Удаление привата.
    channel.delete();
}

module.exports = async (bot, oldMember, newMember) => {
    const actualChannel = newMember.guild.channels.cache.get(newMember.channelId);
    const oldChannel = newMember.guild.channels.cache.get(oldMember.channelId);

    const {guild} = newMember;
    // console.log(newMember.member);
    if (actualChannel?.id === channelsId[newMember.guild.id].createPrivate) {
        return await createPrivate(newMember.member, newMember.member.user.username)
    }
    if (
        oldChannel?.parentId === categories[newMember.guild.id].privatesBlock
        && oldChannel.members.size === 0
        && oldChannel.id !== channelsId[guild.id].createPrivate
    ) {
        return await deletePrivate(newMember.guild, oldChannel.id);
    }

    // сделать логи + обработки остальных заходов
}