const {
    channelsId,
    rolesId,
    categories,
    channelsForCreatePrivate: _channelsForCreatePrivate, categoriesPrivatesId
} = require("../configs/settings");
const {ChannelType, EmbedBuilder, Colors} = require('discord.js');
const sendUserMessage = require("../components/sendUserMessage");
const Privates = require('../models/Privates');

// Функция создания привата.
const createPrivate = async (member, name, parentId, isEveryone, permissions) => {
    // Настройка прав для канала
    const permissionOverwrites = [
        {
            id: member.id,
            allow: ['ViewChannel', 'Connect', 'Speak'],
            deny: ['Administrator']
        },
    ]
    if (isEveryone) {
        permissionOverwrites.push({
            id: member.guild.id,
            allow: ['ViewChannel', 'Connect', 'Speak'],
            deny: ['Administrator', 'MuteMembers', 'MoveMembers', 'ManageChannels', 'DeafenMembers']
        });
    } else {
        permissionOverwrites.push({
            id: member.guild.id,
            allow: ['Connect', 'Speak'],
            deny: ['ViewChannel', 'Administrator', 'MuteMembers', 'MoveMembers', 'ManageChannels', 'DeafenMembers']
        });
    }

    for (const permission of permissions) {
        permissionOverwrites.push(permission);
        // console.log(permission)
    }


    // Новый канал который и будет приватом.
    const privateChannel = await member.guild.channels.create(`${name}`, {
        type: ChannelType.GuildVoice,
        permissionOverwrites,
        parent: parentId,
        reason: `Создан канал для приватных комнат | ${name}`
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

    await Privates.insertMany([{
        authorId: member.id,
        guildId: member.guild.id,
        channelId: privateChannel.id,
    }]);

    return privateChannel;
}

// Функция удаления привата.
const deletePrivate = async (guild, channelId) => {
    // Приват который будем удалять.
    const channel = guild.channels.cache.get(channelId);
    // Удаление привата.
    channel.delete().catch(() => {
        // канал может быть уже каким-то образом удалён, и нужно в случае чего не выдавать ошибку а просто удалить канал.
    });
    await Privates.deleteOne({
        guildId: guild.id,
        channelId,
    })
}

const privatesSystem = async ({
                                  newMember, guildChannelsId, guildRolesId, guildCategories, actualChannel, oldChannel
                              }) => {
    // Каналы при входе в которые будет создаваться приват.
    const channelsForCreatePrivate = _channelsForCreatePrivate(guildChannelsId, guildRolesId);


    // Если айди канала в который зашёл пользователя равен каналу для создания привата, то создаём приват
    if (channelsForCreatePrivate.map(channel => channel.id).includes(actualChannel?.id)) {
        const setting = channelsForCreatePrivate.find(channel => channel.id === actualChannel?.id);
        return await createPrivate(newMember.member, `${setting.emoji} | ${newMember.member.user.username}`, actualChannel.parentId, setting.everyone, setting.permissionsForUsers);
    }

    // Айдишники категории каналов в которых ДОЛЖЕН находится приват чтобы в случае если он был пустой, то удалить его
    const privatesParentsId = categoriesPrivatesId(guildCategories);
    // Если прошлый канал
    if (
        privatesParentsId.includes(oldChannel?.parentId)
        && oldChannel.members.size === 0
        && !channelsForCreatePrivate.map(channel => channel.id).includes(oldChannel.id)
    ) {
        return await deletePrivate(newMember.guild, oldChannel.id);
    }
}

const log = async ({
                       bot, guild, oldMember, newMember, guildChannelsId, actualChannel, oldChannel
                   }) => {
    // Канал куда будут логироваться сообщения.
    const logChannel = guild.channels.cache.get(guildChannelsId.voicesLog);
    const oldStreaming = oldMember.streaming;
    const newStreaming = newMember.streaming;
    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTimestamp()
        .setAuthor({
            name: `${newMember.member.user.tag} ${newMember.member.user.username ? `(${newMember.member.user.username})` : ''}`,
            iconURL: newMember.member.user.displayAvatarURL({size: 2048, dynamic: true, format: 'png'}),
        })
        .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
        });

    if (oldStreaming && !newStreaming) {
        embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.username ? `(${oldMember.member.user.username})` : ''} закончил прямой эфир в **${oldMember.channel.name}**`)
        embed.addFields([
            {
                name: `Канал`,
                value: `${oldMember ? `<#${oldMember.channel.id}> (${oldMember.channel.name})` : `<#${newMember.channel.id}> (${newMember.channel.name})`}`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})`,
            },
        ])
        return await logChannel.send({
            embeds: [embed],
        });
    }

    if (!oldStreaming && newStreaming) {
        embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.username ? `(${oldMember.member.user.username})` : ''} начал прямой эфир в **${oldMember.channel.name}**`)
        embed.addFields([
            {
                name: `Канал`,
                value: `${oldMember ? `<#${oldMember.channel.id}> (${oldMember.channel.name})` : `<#${newMember.channel.id}> (${newMember.channel.name})`}`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})`,
            },
        ])
        return await logChannel.send({
            embeds: [embed],
        });
    }

    if (oldChannel && actualChannel && oldMember?.channelId !== newMember?.channelId) {
        embed.setDescription(`**${newMember.member.user.tag}** ${newMember.member.user.username ? `(${newMember.member.user.username})` : ''} переместился с **${oldMember.channel.name}** в **${newMember.channel.name}**`)
        embed.addFields([
            {
                name: `Текущий канал`,
                value: `<#${newMember.channel.id}> (${newMember.channel.name})`,
            },
            {
                name: `Прошлый канал`,
                value: `<#${oldMember.channel.id}> (${oldMember.channel.name})`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${newMember.member.user} (${newMember.member.user.id})\n**Текущий канал:** ${newMember.channel} (${newMember.channel.id})\n**Предыдущий канал:** ${oldMember.channel} (${oldMember.channel.id})`
            }
        ])
        return await logChannel.send({
            embeds: [embed],
        });
    }
    if (!oldChannel && actualChannel) {
        embed.setDescription(`**${newMember.member.user.tag}** ${newMember.member.user.username ? `(${newMember.member.user.username})` : ''} присоединился в голосовой канал **${newMember.channel.name}**`)
        embed.addFields([
            {
                name: `Канал`,
                value: `<#${newMember.channel.id}> (${newMember.channel.name})`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${newMember.member.user} (${newMember.member.user.id})\n**Канал:** ${newMember.channel} (${newMember.channel.id})`
            }
        ])
        return await logChannel.send({
            embeds: [embed],
        })
    }
    if (oldChannel && !actualChannel) {
        embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.username ? `(${oldMember.member.user.username})` : ''} покинул голосовой канал **${oldMember.channel.name}**`)
        embed.addFields([
            {
                name: `Канал`,
                value: `<#${oldMember.channel.id}> (${oldMember.channel.name})`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})`
            }
        ])
        return await logChannel.send({
            embeds: [embed],
        });
    }

    const logs = await oldMember.guild.fetchAuditLogs({
        before: null,
        limit: 5,
        type: 24
    }).catch(() => {
    })
    const log = logs.entries.find(e => e.target.id === oldMember.id)
    if (!log || Date.now() - ((log.id / 4194304) + 1420070400000) > 3000) {
        return
    }
    const user = log.executor
    if (log.changes[0].key == 'mute') {
        embed.addFields([
            {
                name: `Канал`,
                value: `<#${oldMember.channel.id}> (${oldMember.channel.name})`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})`
            }
        ])
        if (log.changes[0].old) {
            embed.addFields([
                {
                    name: `Действие`,
                    value: `Снятие мута`
                },
                {
                    name: `Информация`,
                    value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})\n**Снял мут:** ${user} (${user.id})`
                }
            ]);
            embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.nickname ? `(${oldMember.member.user.nickname})` : ''} был размучен в голосовой канале **(${oldMember.channel.name})**`);
            return await logChannel.send({
                embeds: [embed]
            })
        } else {
            embed.addFields([
                {
                    name: `Действие`,
                    value: `Выдача мута`
                },
                {
                    name: `Информация`,
                    value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})\n**Выдал мут:** ${user} (${user.id})`
                }
            ]);
            embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.nickname ? `(${oldMember.member.user.nickname})` : ''} был замучен в голосовой канале **(${oldMember.channel.name})**`);
            return await logChannel.send({
                embeds: [embed]
            })
        }
    }
    if (log.changes[0].key == 'deaf') {
        embed.addFields([
            {
                name: `Канал`,
                value: `<#${oldMember.channel.id}> (${oldMember.channel.name})`,
            },
            {
                name: `Информация`,
                value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})`
            }
        ])
        if (log.changes[0].old) {
            embed.addFields([
                {
                    name: `Действие`,
                    value: `Снятие заглушки`
                },
                {
                    name: `Информация`,
                    value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})\n**Снял заглушку:** ${user} (${user.id})`
                }
            ]);
            embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.nickname ? `(${oldMember.member.user.nickname})` : ''} был разглушен в голосовой канале **(${oldMember.channel.name})**`);
            return await logChannel.send({
                embeds: [embed]
            })
        } else {
            embed.addFields([
                {
                    name: `Действие`,
                    value: `Выдача заглушки`
                },
                {
                    name: `Информация`,
                    value: `**Участник:** ${oldMember.member.user} (${oldMember.member.user.id})\n**Канал:** ${oldMember.channel} (${oldMember.channel.id})\n**Выдал заглушку:** ${user} (${user.id})`
                }
            ]);
            embed.setDescription(`**${oldMember.member.user.tag}** ${oldMember.member.user.nickname ? `(${oldMember.member.user.nickname})` : ''} был заглушен в голосовой канале **(${oldMember.channel.name})**`);
            return await logChannel.send({
                embeds: [embed]
            })
        }
    }
}

const giveRoleColloquy = async ({
                                    newMember, guildChannelsId, guildRolesId, actualChannel, oldChannel
                                }) => {
    // Роль, которую будут выдавать.
    const {colloquyCandidate: colloquyCandidateRoleId} = guildRolesId;
    // Каналы собеседования(в том числе комната ожидания, результатов собеседования).
    const colloquyChannelsId = [guildChannelsId.waitingColloquy, // комната ожидания собеседования
        guildChannelsId.colloquy1, // собеседование 1
        guildChannelsId.colloquy2, // собеседование 2
        guildChannelsId.colloquy3, // собеседование 3
        guildChannelsId.colloquy4, // собеседование 4
        guildChannelsId.colloquy5, // собеседование 5
    ];
    // Если текущего канала нет, но прошлый канал есть и он был каналом собеседования,
    // то снимаем роль кандидат на собеседование
    if (!actualChannel && colloquyChannelsId.includes(oldChannel?.id)) {
        return newMember.member.roles.remove(colloquyCandidateRoleId);
    }
    // Если текущий канал есть, и он канал собеседования,
    // то выдаём роль кандидата на собеседование
    if(colloquyChannelsId.includes(actualChannel?.id) && !oldChannel){
        return newMember.member.roles.add(colloquyCandidateRoleId);
    }
}

module.exports = async (bot, oldMember, newMember) => {
    // Актуальный канал в котором сейчас находится пользователь. Может быть null
    const actualChannel = newMember.guild.channels.cache.get(newMember.channelId);
    // Прошлый канал в котором находился пользователь. Может быть null
    const oldChannel = newMember.guild.channels.cache.get(oldMember.channelId);

    const {guild} = newMember;
    // Категории сервера
    const guildCategories = categories[guild.id];
    // Каналы сервера
    const guildChannelsId = channelsId[guild.id];
    // Роли сервера
    const guildRolesId = rolesId[guild.id];

    // Запускаем систему приватов
    await privatesSystem({
        bot, guild, oldMember, newMember, guildChannelsId, guildRolesId, guildCategories, actualChannel, oldChannel
    })
    // Логируем действия
    await log({
        bot, guild, oldMember, newMember, guildChannelsId, actualChannel, oldChannel
    });
    // Выдаем/снимаем роль кандидата на собеседование
    await giveRoleColloquy({
        newMember, guildChannelsId, guildRolesId, actualChannel, oldChannel
    });
    await bot.modules.get(`coins`).run({bot, oldMember, newMember});
}