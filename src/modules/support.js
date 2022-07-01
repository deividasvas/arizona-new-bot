const Tickets = require('../models/Tickets')
const {
    supportSettings, getGuildChannelsId, getGuildCategoriesId, getGuildRolesId
} = require('../configs/settings')
const {
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
    AttachmentBuilder, Attachment
} = require('discord.js')
const createTicket = require('../components/createTicket')
const getTicket = require('../components/getTicket')
const setModerInfoParam = require('../components/setModerInfoParam')
const settings = require('../configs/settings')
const parseIdFromMention = require('../components/parseIdFromMention')
const fs = require('fs')
const path = require('path')
const sendUserMessage = require('../components/sendUserMessage')
const log = require("../components/log");
// Коллекция КД для создания тикетов
// Ключ - айди человека, а значение - дата конца КД.
const createTicketIntervalCollection = new Collection()
setInterval(() => {
    // Каждые 5 секунд перебираем список людей у которых есть действующее КД.
    // Если прошли 5 минут КД, то удаляем человека из списка.
    createTicketIntervalCollection.map((
        (dateStart, userId) => {
            const minutes = (
                (
                    new Date()
                ).getTime() - (
                    new Date(dateStart)
                ).getTime()
            ) / 60000
            if (minutes >= 5) {
                return createTicketIntervalCollection.delete(userId)
            }
        }
    ))
}, 5000)

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы обрабатывать тикеты.
    */
    autoRun: false, // автоматический запуск модуля
    name: 'support', // имя модуля
    acceptCustomsId: [
        'createTicket',
        'closeTicket',
        'holdTicket',
        'openTicket',
        'ticketGoodJob',
        'ticketBadJob'
    ], // модуль автоматически принимает эти айдишники interaction.customId
    async openTicket({
                         bot,
                         interaction,
                         member,
                         categoriesId,
                         fullPermissionsRolesId,
                         moderatorsRolesId,
                         guild,
                         authorTicket
                     }) {
        if (!member.permissions.has('Administrator') && !member.roles.cache.some(role => fullPermissionsRolesId.includes(role.id)) && !member.roles.cache.some(role => moderatorsRolesId.includes(role.id))) {
            return interaction.reply({
                ephemeral: true, embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**У Вас не достаточно доступа!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }
        const ticketChannel = interaction.channel

        const ticket = await getTicket(guild.id, interaction.channelId, authorTicket.id)
        if (ticket.moderatorId === '0') {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Тикет уже находиться в обработке!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }

        if (ticket.moderatorId !== member.id) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Вы не можете отказаться от рассмотрения потому, что, Вы не брали данный тикет!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }

        await ticketChannel.setParent(categoriesId.activeTickets, {
            lockPermissions: false
        })

        await ticketChannel.send({
            content: `<@${ticket.authorId}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Обновление статуса!`)
                    .setDescription(`**Модератор ${interaction.member} отказался от обработки Вашего вопроса. Ожидайте пока его возьмёт кто-нибудь другой!**`)
                    .setColor(Colors.Orange)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })

            ]
        })

        log(19, {
            guildId: guild.id, // ID сервера
            discordId: authorTicket.id, // ID упомянутого участника
            discordTag: authorTicket.user.tag, // Tag упомянутого участника
            discordNick: authorTicket.displayName, // Серверный ник упомянутого участника
            moderatorId: member.id, // ID автора сообщения
            moderatorTag: member.user.tag, // Tag автора сообщения
            moderatorNick: member.displayName, // Серверный ник автора сообщения
            ticket: ticket.ticketId
        })

        await Tickets.updateOne({
            ...ticket
        }, {
            moderatorId: '0',
            status: 1
        })
        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(`***Техническая поддержка ⚡️ ${guild.name}!***`)
                    .addFields([
                        ...interaction.message.embeds[0].fields.slice(0, 2),
                        {
                            name: `Статус жалобы:`, value: `В обработке`
                        }
                    ])
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('closeTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji({
                                name: `🔒`
                            })
                            .setDisabled(true)
                            .setLabel(`Закрыть`),
                        new ButtonBuilder()
                            .setCustomId('holdTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(false)
                            .setEmoji({
                                name: `🔐`
                            })
                            .setLabel(`Обработать`),
                        new ButtonBuilder()
                            .setCustomId('openTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                            .setEmoji({
                                name: `🔓`
                            })
                            .setLabel(`Открыть`)
                    ])
            ]
        })
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Успешно!`)
                    .setDescription(`**Вы успешно отказались от рассмотрения тикета!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })

    },
    async createTicket({bot, interaction, guild, member, moderatorsRolesId, fullPermissionsRolesId, categoriesId}) {
        if (createTicketIntervalCollection.has(member.id)) {
            // Количество секунд через сколько можно будет написать новый тикет.
            const dateEnd = new Date(createTicketIntervalCollection.get(member.id))
            const minutes = Math.round((
                dateEnd - new Date()
            ) / 60000)

            interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`⏳ | Стой-стой!`)
                        .setDescription(`**Полегче друг, у тебя действует интервал на создание тикетов. Написать новый тикет ты сможешь через \`${minutes}\` минут(у)**`)
                        .setColor(Colors.Blue)
                        .setTimestamp()
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
            return
        }
        // ID тикета который будет установлен текущему.
        const newTicketId = (
            await Tickets.find({}).sort({$natural: -1}).limit(1)
        )[0]?.ticketId + 1 || 1
        // массив с правами на канал.
        const permissions = []

        for (const moderatorRoleId of moderatorsRolesId) {
            // Права для модераторов.
            permissions.push({
                id: moderatorRoleId,
                allow: ['ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions'],
                deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTTSMessages', 'ManageMessages', 'MentionEveryone', 'RequestToSpeak', 'UseApplicationCommands', 'ManageThreads']
            })
        }

        for (const fullPermissionRoleId of fullPermissionsRolesId) {
            // Права для ролей с полным доступом
            permissions.push({
                id: fullPermissionRoleId,
                allow: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTTSMessages', 'ManageMessages', 'MentionEveryone', 'RequestToSpeak', 'UseApplicationCommands', 'ManageThreads', 'UseExternalStickers']
            })
        }

        // Права для @everyone
        permissions.push({
            id: guild.id,
            deny: ['ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTTSMessages', 'ManageMessages', 'MentionEveryone', 'RequestToSpeak', 'UseApplicationCommands', 'ManageThreads', 'UseExternalStickers']
        })

        // Права для автора тикета
        permissions.push({
            id: member.id,
            allow: ['ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions'],
            deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTTSMessages', 'ManageMessages', 'MentionEveryone', 'RequestToSpeak', 'UseApplicationCommands', 'ManageThreads', , 'UseExternalStickers']
        })

        const newTicketChannel = await guild.channels.create({
            name: `${supportSettings.ticketNameStartsWith}-${newTicketId}`,
            permissionOverwrites: permissions, parent: categoriesId.activeTickets, reason: `Создание тикета`
        })

        await createTicket(
            newTicketId,
            guild.id,
            member.id,
            new Date(),
            new Date(),
            '0',
            '',
            newTicketChannel.id
        ) // создаём и сохраняем тикет в базу данных

        // Отправляем сообщение с информацией и кнопками в тикет.
        await newTicketChannel.send({
            content: `<@${member.id}> ${moderatorsRolesId.map((roleId) => `<@&${roleId}>`).join(' ')}`, embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(`***Техническая поддержка ⚡️ ${guild.name}!***`)
                    .addFields([
                        {
                            name: `Ник пользователя:`,
                            value: `\`${member.displayName || member.user.tag}\``,
                            inline: true
                        }, {
                            name: `ID Пользователя`, value: `\`${member.id}\``, inline: true
                        }, {
                            name: `Статус жалобы:`, value: `В обработке`
                        }
                    ])
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ], components: [
                new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('closeTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                            .setEmoji({
                                name: `🔒`
                            })
                            .setLabel(`Закрыть`),
                        new ButtonBuilder()
                            .setCustomId('holdTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji({
                                name: `🔐`
                            })
                            .setLabel(`Обработать`),
                        new ButtonBuilder()
                            .setCustomId('openTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji({
                                name: `🔓`
                            })
                            .setDisabled(true)
                            .setLabel(`Открыть`)
                    ])
            ]
        })

        interaction.reply({
            ephemeral: true, embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Создание тикета`)
                    .setDescription(`**Ваш тикет был успешно создан! Вы можете задать вопрос в этом канале <#${newTicketChannel.id}> **`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })
        const endDate = new Date()
        endDate.setMinutes(endDate.getMinutes() + 5)
        createTicketIntervalCollection.set(member.id, endDate) // ставим человеку КД на создание тикетов.
        return newTicketChannel.id
    },
    async holdTicket({
                         bot,
                         guild,
                         interaction,
                         member,
                         fullPermissionsRolesId,
                         moderatorsRolesId,
                         categoriesId,
                         authorTicket
                     }) {
        if (!member.permissions.has('Administrator') && !member.roles.cache.some(role => fullPermissionsRolesId.includes(role.id)) && !member.roles.cache.some(role => moderatorsRolesId.includes(role.id))) {
            return interaction.reply({
                ephemeral: true, embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**У Вас не достаточно доступа!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }

        const ticketChannel = interaction.channel

        const ticket = await getTicket(guild.id, interaction.channelId, authorTicket.id)
        if (ticket.moderatorId !== '0') {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Тикет уже находиться в рассмотрений другим модератором!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }
        // Меняем категорию тикета на тикеты на рассмотрении.
        await ticketChannel.setParent(categoriesId.holdTickets, {
            lockPermissions: false
        })

        await Tickets.updateOne({
            ...ticket
        }, {
            moderatorId: interaction.member.id,
            status: 2
        })
        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(`***Техническая поддержка ⚡️ ${guild.name}!***`)
                    .addFields([
                        ...interaction.message.embeds[0].fields.slice(0, 2),
                        {
                            name: `Статус жалобы:`, value: `В рассмотрении`
                        }
                    ])
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('closeTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji({
                                name: `🔒`
                            })
                            .setDisabled(false)
                            .setLabel(`Закрыть`),
                        new ButtonBuilder()
                            .setCustomId('holdTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                            .setEmoji({
                                name: `🔐`
                            })
                            .setLabel(`Обработать`),
                        new ButtonBuilder()
                            .setCustomId('openTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(false)
                            .setEmoji({
                                name: `🔓`
                            })
                            .setLabel(`Открыть`)
                    ])
            ]
        })
        await ticketChannel.send({
            content: `<@${ticket.authorId}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('📕 | Обновление статуса!')
                    .setDescription(`**За Ваш тикет взялся ${member}.**`)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setColor(Colors.Orange)
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })
        log(20, {
            guildId: guild.id, // ID сервера
            discordId: authorTicket.id, // ID упомянутого участника
            discordTag: authorTicket.user.tag, // Tag упомянутого участника
            discordNick: authorTicket.displayName, // Серверный ник упомянутого участника
            moderatorId: member.id, // ID автора сообщения
            moderatorTag: member.user.tag, // Tag автора сообщения
            moderatorNick: member.displayName, // Серверный ник автора сообщения
            ticket: ticket.ticketId
        })
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Успешно!`)
                    .setDescription(`**Вы успешно взялись за тикет!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })
    },
    async closeTicket({
                          bot,
                          guild,
                          interaction,
                          member,
                          fullPermissionsRolesId,
                          moderatorsRolesId,
                          categoriesId,
                          authorTicket
                      }) {
        if (!member.permissions.has('Administrator') && !member.roles.cache.some(role => fullPermissionsRolesId.includes(role.id)) && !member.roles.cache.some(role => moderatorsRolesId.includes(role.id))) {
            return interaction.reply({
                ephemeral: true, embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**У Вас не достаточно доступа!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }
        const ticket = await getTicket(guild.id, interaction.channelId, authorTicket.id)
        if (ticket.moderatorId !== interaction.member.id) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Вы не можете закрыть тикет потому, что, Вы не взяли его изначально!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }
        const ticketChannel = interaction.channel
        const newPermissions = []
        for (const moderatorRoleId of moderatorsRolesId) {
            newPermissions.push({
                id: moderatorRoleId,
                allow: ['ViewChannel'],
                deny: ['SendMessages']
            })
        }
        for (const fullPermissionRoleId of fullPermissionsRolesId) {
            newPermissions.push({
                id: fullPermissionRoleId,
                allow: ['ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTTSMessages', 'ManageMessages', 'MentionEveryone', 'RequestToSpeak', 'UseApplicationCommands', 'ManageThreads', 'UseExternalStickers']
            })
        }
        newPermissions.push({
            id: guild.id,
            deny: ['ViewChannel', 'SendMessages']
        })
        newPermissions.push({
            id: ticket.authorId,
            allow: ['ViewChannel'],
            deny: ['SendMessages']
        })

        await ticketChannel.setParent(categoriesId.basketTickets, {
            lockPermissions: false
        })
        await ticketChannel.permissionOverwrites.set(newPermissions)
        await ticketChannel.send({
            content: `<@${ticket.authorId}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('📕 | Оценка работы модератора')
                    .setDescription('**Вашей жалобе был установлен статус - \`Закрыто\`\nНиже Вы можете оценить работу модератора нажав на одну из кнопок!.**')
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setColor(Colors.Orange)
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setEmoji({
                            name: `👍`
                        })
                        .setCustomId('ticketGoodJob'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji({
                            name: `👎`
                        })
                        .setCustomId('ticketBadJob')
                ])
            ]
        })

        await Tickets.updateOne({
            ...ticket
        }, {
            moderatorId: interaction.member.id,
            status: 3
        })
        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(`***Техническая поддержка ⚡️ ${guild.name}!***`)
                    .addFields([
                        ...interaction.message.embeds[0].fields.slice(0, 2),
                        {
                            name: `Статус жалобы:`, value: `Закрыто`
                        }
                    ])
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('closeTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji({
                                name: `🔒`
                            })
                            .setDisabled(true)
                            .setLabel(`Закрыть`),
                        new ButtonBuilder()
                            .setCustomId('holdTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                            .setEmoji({
                                name: `🔐`
                            })
                            .setLabel(`Обработать`),
                        new ButtonBuilder()
                            .setCustomId('openTicket')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                            .setEmoji({
                                name: `🔓`
                            })
                            .setLabel(`Открыть`)
                    ])
            ]
        })

        log(21, {
            guildId: guild.id, // ID сервера
            discordId: authorTicket.id, // ID упомянутого участника
            discordTag: authorTicket.user.tag, // Tag упомянутого участника
            discordNick: authorTicket.displayName, // Серверный ник упомянутого участника
            moderatorId: member.id, // ID автора сообщения
            moderatorTag: member.user.tag, // Tag автора сообщения
            moderatorNick: member.displayName, // Серверный ник автора сообщения
            ticket: ticket.ticketId
        })

        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'main',
            'tickets',
            ({tickets}) => tickets + 1
        )
        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'week',
            'tickets',
            ({tickets}) => tickets + 1
        )

        // выдаем недельные баллы и общие
        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'main',
            'balls',
            ({balls, coefficient}) => balls + settings.rates.ticket * coefficient
        )
        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'week',
            'balls',
            ({balls, coefficient}) => balls + settings.rates.ticket * coefficient
        )
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Успешно!`)
                    .setDescription(`**Вы успешно закрыли тикет!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })

        const messagesOfTicket = (
            await ticketChannel.messages.fetch()
        ).map((message) => message)
        const pathToFile = path.join(__dirname, `../files/${ticketChannel.id}.txt`)
        const contentFile = messagesOfTicket.reverse().map(message => {
            const dateCreateMsg = new Date(message.createdAt)
            return `${dateCreateMsg.getFullYear()}-${dateCreateMsg.getMonth() + 1}-${dateCreateMsg.getDate()} ${dateCreateMsg.getHours()}:${dateCreateMsg.getMinutes()}:${dateCreateMsg.getSeconds()} | ${message.author.tag} (${message.author.id}) | "${message.content}" | ${JSON.stringify(message.embeds)}`
        })
        await fs.writeFileSync(pathToFile, contentFile.join('\n'))

        await sendUserMessage({
            content: `Ваш тикет №${ticket.ticketId} был закрыт. Ниже предоставлен полный диалог из тикета`,
            files: [
                pathToFile
            ]
        }, ticket.authorId, guild)
        await fs.unlinkSync(pathToFile)
    },
    // Функция для логирования действий в канал логи-тикетов
    async logTicketAction(type, guildId, bot, member, ticketChannelId) {
        const channelsId = getGuildChannelsId(guildId)

        const guild = bot.guilds.cache.get(guildId)
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
            })
            .setFooter({
                text: 'Robo Hamster',
                iconURL: bot.user.displayAvatarURL()
            })
        const logChannel = guild.channels.cache.get(channelsId.ticketsLog)
        const ticketChannel = guild.channels.cache.get(ticketChannelId)
        switch (type) {
            case 'create': {
                embed.setTitle('📌 | Создание тикета!')
                embed.setDescription(`**Пользователь ${member} (${member.id}) создал обращение <#${ticketChannel.id}> (${ticketChannel.name})**`)
                break
            }

            case 'close': {
                embed.setTitle('📌 | Закрытие тикета!')
                embed.setDescription(`**Модератор ${member} (${member.id}) закрыл тикет <#${ticketChannel.id}> (${ticketChannel.name})**`)
                break
            }

            case 'hold': {
                embed.setTitle('📌 | Обработка тикета!')
                embed.setDescription(`**Модератор ${member} (${member.id}) взял в обработку тикет <#${ticketChannel.id}> (${ticketChannel.name})**`)
                break
            }

            case 'open': {
                embed.setTitle('📌 | Открытие тикета!')
                embed.setDescription(`**Модератор ${member} (${member.id}) отказался от тикета <#${ticketChannel.id}> (${ticketChannel.name})**`)
                break
            }
            case 'good-job': {
                embed.setTitle('📌 | Положительная оценка!')
                embed.setDescription(`**Пользователь ${member} (${member.id}) поставил положительную оценку в тикете <#${ticketChannel.id}> (${ticketChannel.name})**`)
                break
            }
            case 'bad-job': {
                embed.setTitle('📌 | Отрицательная оценка!')
                embed.setDescription(`**Пользователь ${member} (${member.id}) поставил отрицательную оценку в тикете <#${ticketChannel.id}> (${ticketChannel.name})**`)
                break
            }
        }
        if (type === 'close') {
            const messagesOfTicket = (
                await ticketChannel.messages.fetch()
            ).map((message) => message)
            const pathToFile = path.resolve(`./src/files/${ticketChannel.id}.txt`)
            const contentFile = messagesOfTicket.reverse().map(message => {
                const dateCreateMsg = new Date(message.createdAt)
                return `${dateCreateMsg.getFullYear()}-${dateCreateMsg.getMonth() + 1}-${dateCreateMsg.getDate()} ${dateCreateMsg.getHours()}:${dateCreateMsg.getMinutes()}:${dateCreateMsg.getSeconds()} | ${message.author.tag} (${message.author.id}) | "${message.content}" | ${JSON.stringify(message.embeds)}`
            })
            await fs.appendFileSync(pathToFile, contentFile.join('\n'))
        }

        await logChannel.send({
            embeds: [
                embed
            ],
            files: type === 'close' ? [
                path.resolve(`./src/files/${ticketChannel.id}.txt`)
            ] : []
        })
        if (type === 'close') {
            fs.unlinkSync(path.resolve(`./src/files/${ticketChannel.id}.txt`))
        }
    },
    async run({bot, interaction}) {
        const guild = bot.guilds.cache.get(interaction.guildId)
        const member = interaction.member
        const rolesId = getGuildRolesId(guild.id)
        const channelsId = getGuildChannelsId(guild.id)
        const categoriesId = getGuildCategoriesId(guild.id)
        // айди модерских ролей которые будут отвечать на тикеты
        const moderatorsRolesId = supportSettings.getModeratorsPermissionRolesId(rolesId)
        // айди ролей у которых имеется полный доступ к тикетам.
        const fullPermissionsRolesId = supportSettings.getFullPermissionRolesId(rolesId)

        const authorTicket = guild.members.cache.get((
            interaction.message.embeds[0].fields || []
        )[1]?.value.split('`')[1])

        const actions = [
            {
                customId: 'createTicket',
                func: this.createTicket,
                log: (ticketId) => {
                    if (!ticketId) {
                        return
                    }
                    this.logTicketAction('create', guild.id, bot, member, ticketId)
                }
            },
            {
                customId: 'holdTicket',
                func: this.holdTicket,
                log: () => this.logTicketAction('hold', guild.id, bot, member, interaction.channelId)
            },
            {
                customId: 'openTicket',
                func: this.openTicket,
                log: () => this.logTicketAction('open', guild.id, bot, member, interaction.channelId)

            },
            {
                customId: 'closeTicket',
                func: this.closeTicket,
                log: () => this.logTicketAction('close', guild.id, bot, member, interaction.channelId)
            },
            {
                customId: 'ticketGoodJob',
                func: this.ticketGoodJob,
                log: () => this.logTicketAction('good-job', guild.id, bot, member, interaction.channelId)
            },
            {
                customId: 'ticketBadJob',
                func: this.ticketBadJob,
                log: () => this.logTicketAction('bad-job', guild.id, bot, member, interaction.channelId)
            }
        ]

        // Ищем действие, которое будем выполнять среди массива по айдишнику интеграции.
        const action = actions.find(action => action.customId === interaction.customId)
        if (action) {
            // запускаем функцию, и в некоторых случаях она возвращает айди нового канала.
            const channelId = await action.func({
                bot,
                guild,
                member,
                interaction,
                rolesId,
                channelsId,
                categoriesId,
                moderatorsRolesId,
                fullPermissionsRolesId,
                authorTicket
            })
            // запускаем функцию логирования в лог-тикетов и передаём туда айдишник тикета.
            await action.log(channelId || interaction.channelId)
        }
    },
    async ticketGoodJob({bot, guild, member, interaction}) {
        const ticket = await getTicket(guild.id, interaction.channelId, parseIdFromMention(interaction.message.content))
        if (member.id !== ticket.authorId) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Вы не являетесь автором тикета!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }

        await Tickets.updateOne({
            ...ticket
        }, {
            rating: 'good'
        })

        interaction.message.edit({
            content: `<@${ticket.authorId}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('📕 | Оценка работы модератора')
                    .setDescription('**Вашей жалобе был установлен статус - \`Закрыто\`\nВы поставили модератору \`положительную\` оценку!.**')
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setColor(Colors.Orange)
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setEmoji({
                            name: `👍`
                        })
                        .setDisabled(true)
                        .setCustomId('ticket-good-job'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji({
                            name: `👎`
                        })
                        .setDisabled(true)
                        .setCustomId('ticket-bad-job')
                ])
            ]
        })

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Положительная оценка!`)
                    .setDescription(`**Вы поставили модератору <@${ticket.moderatorId}> положительную оценку!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })

        const authorTicket = guild.members.cache.get(ticket.authorId);

        log(22, {
            guildId: guild.id, // ID сервера
            discordId: authorTicket.id, // ID упомянутого участника
            discordTag: authorTicket.user.tag, // Tag упомянутого участника
            discordNick: authorTicket.displayName, // Серверный ник упомянутого участника
            moderatorId: member.id, // ID автора сообщения
            moderatorTag: member.user.tag, // Tag автора сообщения
            moderatorNick: member.displayName, // Серверный ник автора сообщения
            ticket: ticket.ticketId
        })

        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'main',
            'goodAnswers',
            ({goodAnswers}) => goodAnswers + 1
        )
        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'week',
            'goodAnswers',
            ({goodAnswers}) => goodAnswers + 1
        )
    },
    async ticketBadJob({bot, guild, member, interaction}) {
        const ticket = await getTicket(guild.id, interaction.channelId, parseIdFromMention(interaction.message.content))
        if (member.id !== ticket.authorId) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Вы не являетесь автором тикета!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }

        const authorTicket = guild.members.cache.get(ticket.authorId);

        await Tickets.updateOne({
            ...ticket
        }, {
            rating: 'bad'
        })

        interaction.message.edit({
            content: `<@${ticket.authorId}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('📕 | Оценка работы модератора')
                    .setDescription('**Вашей жалобе был установлен статус - \`Закрыто\`\nВы поставили модератору \`отрицательную\` оценку!.**')
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setColor(Colors.Orange)
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setEmoji({
                            name: `👍`
                        })
                        .setDisabled(true)
                        .setCustomId('ticket-good-job'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji({
                            name: `👎`
                        })
                        .setDisabled(true)
                        .setCustomId('ticket-bad-job')
                ])
            ]
        })
        log(23, {
            guildId: guild.id, // ID сервера
            discordId: authorTicket.id, // ID упомянутого участника
            discordTag: authorTicket.user.tag, // Tag упомянутого участника
            discordNick: authorTicket.displayName, // Серверный ник упомянутого участника
            moderatorId: member.id, // ID автора сообщения
            moderatorTag: member.user.tag, // Tag автора сообщения
            moderatorNick: member.displayName, // Серверный ник автора сообщения
            ticket: ticket.ticketId
        })
        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'main',
            'toxicAnswers',
            ({toxicAnswers}) => toxicAnswers + 1
        )
        await setModerInfoParam(
            interaction.member.id,
            guild.id,
            'week',
            'toxicAnswers',
            ({toxicAnswers}) => toxicAnswers + 1
        )

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Отрицательная оценка!`)
                    .setDescription(`**Вы поставили модератору <@${ticket.moderatorId}> отрицательную оценку!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        })

    }
}
