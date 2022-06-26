const {Colors, EmbedBuilder} = require("discord.js");
const {scheduleJob} = require("node-schedule");
const {getGuildCategoriesId, getGuildChannelsId, categoriesPrivatesId} = require("../configs/settings");
const Privates = require('../models/Privates');
const convertMinutesToMs = require("../components/convertMinutesToMs");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы отвечать на нажатия кнопок в канале управление
      и в случае чего исполнять какое-то действие по отношению к привату.
    */
    autoRun: false, // автоматический запуск модуля
    // имя модуля
    name: "privateSettings",
    // модуль автоматически принимает эти айдишники interaction.customId
    acceptCustomsId: [
        "addUserPrivate",
        "removeUserPrivate",
        "deletePrivate",
        "changePrivateName",
        "openClosePrivate",
        "hideShowPrivate",
        "setLimitPrivate"
    ],

    // Конфигурация кнопок и соответствующих к ним функций.

    // Функция смены имени привата
    async changePrivateName(bot, interaction, guild, managePrivateChannel, member) {
        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Напишите новое название для привата. У Вас одна минута.**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
        const messages = await managePrivateChannel.awaitMessages({
            filter: (animusInteraction) => animusInteraction.member.id === interaction.member.id,
            max: 1,
            time: convertMinutesToMs(1),
            errors: ['time']
        });
        const answer = messages.first();

        if (answer.content.length >= 32) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Название привата не может превышать 32 символов!**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        const oldNameChannel = member.voice.channel.name;
        await member.voice.channel.setName(answer.content);
        await answer.delete();
        return interaction.followUp({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Вы успешно изменили название привата!\nБыло: \`${oldNameChannel}\`\nСтало: \`${answer.content}\`**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },

    // Функция для установки пользовательского лимита в канале.
    async setUserLimit(bot, interaction, guild, managePrivateChannel, member) {
        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Напишите максимальное количество пользователей в канале для привата. У Вас одна минута.**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
        const messages = await managePrivateChannel.awaitMessages({
            filter: (animusInteraction) => animusInteraction.member.id === interaction.member.id,
            max: 1,
            time: convertMinutesToMs(1),
            errors: ['time']
        });
        const answer = messages.first();
        await answer.delete();
        if (isNaN(Number(answer.content))) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Параметр должен быть числом!**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        if (Number(answer.content) > 99 || Number(answer.content) < 2) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Число должно быть не более 99 и не менее 2**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        const oldUserLimit = member.voice.channel.userLimit;
        await member.voice.channel.setUserLimit(Number(answer.content));
        return interaction.followUp({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Вы успешно изменили количество максимальных людей в привате!\nБыло: \`${oldUserLimit}\`\nСтало: \`${answer.content}\`**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },

    // Функция для закрытия/открытия возможности в канал everyone.
    async openClosePrivate(bot, interaction, guild, managePrivateChannel, member) {
        const privateChannel = member.voice.channel;

        // Если у everyone нет возможности захода в канал, то добавляем её. Если наоборот, то убираем.
        if (!privateChannel.permissionOverwrites.cache.get(guild.id).allow.serialize()['Connect']) {
            await privateChannel.permissionOverwrites.edit(guild.id, {
                ViewChannel: true,
                Connect: true,
                Speak: true,
                UseVAD: true,
                Stream: true,
            })
        } else {
            await privateChannel.permissionOverwrites.edit(guild.id, {
                ViewChannel: true,
                Connect: false,
                Speak: false,
                UseVAD: false,
                Stream: false,
            })
        }

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Вы успешно выключили/включили возможность людям видеть канал!**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },

    async hideOrShowChannel(bot, interaction, guild, managePrivateChannel, member) {
        const privateChannel = member.voice.channel;

        // Если у everyone нет возможности просмотра канала, то добавляем её. Если наоборот, то убираем.
        if (!privateChannel.permissionOverwrites.cache.get(guild.id).allow.serialize()['ViewChannel']) {
            await privateChannel.permissionOverwrites.edit(guild.id, {
                ViewChannel: true,
                Connect: true,
                Speak: true,
                UseVAD: true,
                Stream: true,
            })
        } else {
            await privateChannel.permissionOverwrites.edit(guild.id, {
                ViewChannel: false,
                Connect: true,
                Speak: true,
                UseVAD: true,
                Stream: true,
            })
        }

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Вы успешно выключили/включили возможность людям заходить в канал!**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },

    async addUserPermissionInPrivateChannel(bot, interaction, guild, managePrivateChannel, member) {
        const privateChannel = member.voice.channel;
        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Пинганите пользователя которому будет дан доступ к привату. У Вас одна минута.**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
        const messages = await managePrivateChannel.awaitMessages({
            filter: (animusInteraction) => animusInteraction.member.id === interaction.member.id,
            max: 1,
            time: convertMinutesToMs(1),
            errors: ['time']
        });
        const answer = messages.first();
        await answer.delete();
        if (!answer.mentions.members) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Вы не упомянули пользователя.**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        const userMember = answer.mentions.members.first();
        await privateChannel.permissionOverwrites.edit(userMember.id, {
            ViewChannel: true,
            Connect: true,
            Speak: true,
            UseVAD: true,
            Stream: true,
        });

        interaction.followUp({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Вы успешно дали доступ ${userMember} к Вашему привату!**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },

    async deleteUserPermissionInPrivateChannel(bot, interaction, guild, managePrivateChannel, member) {
        const privateChannel = member.voice.channel;
        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Пинганите пользователя которому будет убран доступ к привату. У Вас одна минута.**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
        const messages = await managePrivateChannel.awaitMessages({
            filter: (animusInteraction) => animusInteraction.member.id === interaction.member.id,
            max: 1,
            time: convertMinutesToMs(1),
            errors: ['time']
        });
        const answer = messages.first();
        await answer.delete();
        if (!answer.mentions.members) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Вы не упомянули пользователя.**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        const userMember = answer.mentions.members.first();
        if (userMember.voice.channelId !== member.voice.channelId) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Пользователь не находится в Вашем привате!**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }

        await userMember.voice.disconnect(`Кикнут владельцем привата из привата`);

        interaction.followUp({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Пользователь ${userMember} успешно исключен из Вашего привата!**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },

    async deletePrivate(bot, interaction, guild, managePrivateChannel, member) {
        await member.voice.channel.delete();
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Настройка привата!`)
                    .setColor(Colors.Blue)
                    .setDescription(`**Приват был успешно удалён!**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
        await Privates.deleteOne({
           channelId: member.voice.channelId,
           guildId: guild.id
        })
    },

    async run({bot, interaction, member}) {
        // Команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

        // Конфигурация кнопок и соответствующих им функций
        const config = [
            {
                customId: "changePrivateName",
                func: this.changePrivateName,
            },
            {
                customId: "openClosePrivate",
                func: this.openClosePrivate
            },
            {
                customId: "setLimitPrivate",
                func: this.setUserLimit
            },
            {
                customId: "hideShowPrivate",
                func: this.hideOrShowChannel
            },
            {
                customId: `addUserPrivate`,
                func: this.addUserPermissionInPrivateChannel
            },
            {
                customId: `removeUserPrivate`,
                func: this.deleteUserPermissionInPrivateChannel
            },
            {
                customId: `deletePrivate`,
                func: this.deletePrivate,
            }
        ];
        const guild = bot.guilds.cache.get(interaction.guildId);
        const channelsId = getGuildChannelsId(guild.id);
        const categories = getGuildCategoriesId(guild.id);
        const categoriesPrivate = categoriesPrivatesId(categories);
        if (!member.voice.channel) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Вы не находитесь в голосовом канале!**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }

        // Если канал не находится в категориях приватов, то соответственно это не приват и нужно выдать ошибку.
        if (!categoriesPrivate.includes(member.voice.channel.parentId)) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Канал в котором Вы находитесь не является приватом!**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }

        const privateFromDataBase = await Privates.findOne({
            guildId: guild.id,
            userId: interaction.member.id,
            channelId: member.voice.channel.id
        });

        if (!privateFromDataBase) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Вы не являетесь владельцем привата в котором находитесь!**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }

        const managePrivate = guild.channels.cache.get(channelsId.managePrivate);
        const action = config.find(configuration => configuration.customId === interaction.customId);
        await action.func(bot, interaction, guild, managePrivate, member);
    },
};
