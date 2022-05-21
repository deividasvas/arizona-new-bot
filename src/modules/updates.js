const {channelsId: _channelsId, rolesId: _rolesId, categories: _categories, rolesId} = require("../configs/settings");
const {EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const sendUserMessage = require("../components/sendUserMessage");
const parseIdFromMention = require("../components/parseIdFromMention");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы обрабатывать запросы от баг трекера.
    */
    autoRun: false, // автоматический запуск модуля
    name: "updates", // имя модуля
    acceptCustomsId: [
        "createBugReport",
        `acceptBug`,
        `denyBug`,
        `deleteBug`,
    ], // модуль автоматически принимает эти айдишники interaction.customId
    async createBugReport({interaction, bot, member, guild, channelsId, rolesId}) {
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Предложения по улучшению!`)
                    .setColor(Colors.DarkPurple)
                    .setDescription(`**Укажите текст проблемы. У Вас 5 минут. Длина сообщения не должна превышать 1000 символов!**`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ],
        });
        const messages = await interaction.channel.awaitMessages({
            filter: (msg) => msg.author.id === member.id,
            time: (1000 * 60) * 5,
            max: 1,
        });
        if (!messages.size) {
            return;
        }
        const answerMessage = messages.first();
        if (answerMessage.content.length >= 1000) {
            return interaction.followUp({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Длина текста превышает 1000 символов!**`)
                        .setColor(Colors.Red)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }

        const updatesChannel = guild.channels.cache.get(channelsId.updates);
        const row = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setEmoji({
                        name: `👍`
                    })
                    .setCustomId(`acceptBug`),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji({
                        name: `👎`
                    })
                    .setCustomId(`denyBug`),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji({
                        name: `🇩`
                    })
                    .setCustomId(`deleteBug`)
            ])
        updatesChannel.send({
            content: `<@&${rolesId.adviceAdministration}> <@&${rolesId.juniorDiscordMaster}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle(`🤔 | А это идея!`)
                    .setTimestamp()
                    .addFields([
                        {
                            name: `Пользователь`,
                            value: `<@${member.id}>`,
                        },
                        {
                            name: `Суть обращения`,
                            value: answerMessage.content,
                        },
                    ])
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ],
            components: [row]
        })
        interaction.followUp({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`🤔 | А это идея!`)
                    .setTimestamp()
                    .setDescription(`**Слушай, а задумка то интересная. Передал её тех.отделу этого дискорд сервера. Как только будут новости - обязательно тебе сообщу!**`)
            ]
        })
        await answerMessage.delete();
    },
    async acceptBug({bot, interaction, guild, member}) {
        const senderId = parseIdFromMention(interaction.message.embeds[0].fields[0].value);
        const text = interaction.message.embeds[0].fields[1].value;
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`👍 | Твоя идея класс!`)
                    .setTimestamp()
                    .setDescription(`**Привет! Если ты помнишь, ты писал предложение по улучшению дискорд сервера \`${guild.name}\`. Так, вот, могу обрадовать! Твоя идея понравилась администрации дискорда! Ниже предоставлена информация!**`)
                    .addFields([
                        {
                            name: `Текст идеи`,
                            value: interaction.message.embeds[0].fields[1].value
                        },
                        {
                            name: `Одобрил`,
                            value: `${member}`
                        }
                    ])
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        }, senderId, guild);
        await interaction.deferUpdate();
        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`👍 | Предложение одобрено!`)
                    .setColor(Colors.DarkGreen)
                    .addFields([
                            {
                                name: "Автор предложения",
                                value: `<@${senderId}>`
                            },
                            {
                                name: "Одобрил",
                                value: `<@${member.id}>`
                            },
                            {
                                name: "Суть обращения",
                                value: `${text}`
                            }
                        ]
                    )
                    .setAuthor(interaction.message.embeds[0].author)
                    .setFooter(interaction.message.embeds[0].footer)
            ],
            components: []
        });
    },
    async denyBug({bot, interaction, guild, member}) {
        const senderId = parseIdFromMention(interaction.message.embeds[0].fields[0].value);
        const text = interaction.message.embeds[0].fields[0].value;

        interaction.reply({
            content: `${member}`,
            ephemeral: false,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Предложения по улучшению!`)
                    .setColor(Colors.DarkPurple)
                    .setDescription(`**Укажите причину по которой Вы отказываете баг пользователя! У Вас пять минут**`)
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
        const messages = await interaction.channel.awaitMessages({
            filter: (msg) => msg.author.id === member.id,
            time: (1000 * 60) * 5,
            max: 1,
        });
        if (!messages.size) {
            return;
        }
        const answerMessage = messages.first();
        interaction.deleteReply();
        await answerMessage.delete();
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkRed)
                    .setTitle(`🇩 | Ой..!`)
                    .setTimestamp()
                    .setDescription(`**Привет! Если ты помнишь, ты писал предложение по улучшению дискорд сервера \`${guild.name}\`. Так вот, очень плохие новости. Тех. отделу настолько не понравилось твоё улучшение что они решили его удалить. Не знаю почему, можешь узнать ты ниже. Если будут вопросы, то обязательно напиши в саппорт!**`)
                    .addFields([
                        {
                            name: `Текст идеи`,
                            value: interaction.message.embeds[0].fields[1].value
                        },
                        {
                            name: `Удалил`,
                            value: `${member}`
                        },
                        {
                            name: `Причина`,
                            value: `${answerMessage.content}`
                        }
                    ])
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        }, senderId, guild);


        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`🇩 | Предложение отказано!`)
                    .setColor(Colors.DarkRed)
                    .addFields([
                            {
                                name: "Автор предложения",
                                value: `<@${senderId}>`
                            },
                            {
                                name: "Удалил",
                                value: `<@${member.id}>`
                            },
                            {
                                name: "Суть обращения",
                                value: `${text}`
                            },
                            {
                                name: "Причина",
                                value: `${answerMessage.content}`
                            }
                        ]
                    )
                    .setAuthor(interaction.message.embeds[0].author)
                    .setFooter(interaction.message.embeds[0].footer)
            ],
            components: []
        });
    },
    async deleteBug({bot, interaction, guild, member}) {
        const senderId = parseIdFromMention(interaction.message.embeds[0].fields[0].value);
        const text = interaction.message.embeds[0].fields[0].value;

        interaction.reply({
            content: `${member}`,
            ephemeral: false,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Предложения по улучшению!`)
                    .setColor(Colors.DarkPurple)
                    .setDescription(`**Укажите причину по которой Вы удаляете баг пользователя! У Вас пять минут**`)
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
        const messages = await interaction.channel.awaitMessages({
            filter: (msg) => msg.author.id === member.id,
            time: (1000 * 60) * 5,
            max: 1,
        });
        if (!messages.size) {
            return;
        }
        const answerMessage = messages.first();
        interaction.deleteReply();
        await answerMessage.delete();
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkAqua)
                    .setTitle(`⛔ | Упс..!`)
                    .setTimestamp()
                    .setDescription(`**Привет! Если ты помнишь, ты писал предложение по улучшению дискорд сервера \`${guild.name}\`. Так вот, есть некоторые новости. К огромному сожалению, твоё предложение было отказано. Не знаю почему, можешь узнать причину немного ниже.**`)
                    .addFields([
                        {
                            name: `Текст идеи`,
                            value: interaction.message.embeds[0].fields[1].value
                        },
                        {
                            name: `Отказал`,
                            value: `${member}`
                        },
                        {
                            name: `Причина`,
                            value: `${answerMessage.content}`
                        }
                    ])
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        }, senderId, guild);


        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`⛔ | Предложение удалено!`)
                    .setColor(Colors.DarkAqua)
                    .addFields([
                            {
                                name: "Автор предложения",
                                value: `<@${senderId}>`
                            },
                            {
                                name: "Удалил",
                                value: `<@${member.id}>`
                            },
                            {
                                name: "Суть обращения",
                                value: `${text}`
                            },
                            {
                                name: "Причина",
                                value: `${answerMessage.content}`
                            }
                        ]
                    )
                    .setAuthor(interaction.message.embeds[0].author)
                    .setFooter(interaction.message.embeds[0].footer)
            ],
            components: []
        });
    },
    async run({interaction, bot}) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        const actions = [
            {
                customId: "createBugReport",
                func: this.createBugReport,
            },
            {
                customId: `acceptBug`,
                func: this.acceptBug
            },
            {
                customId: `denyBug`,
                func: this.denyBug
            },
            {
                customId: `deleteBug`,
                func: this.deleteBug
            }
        ]
        const action = actions.find(action => action.customId === interaction.customId);
        const guild = bot.guilds.cache.get(interaction.guildId);
        const rolesId = _rolesId[guild.id];
        const channelsId = _channelsId[guild.id];
        const categoriesId = _categories[guild.id];

        // Ниже описаны кастом айдишники и массив с ролями которым можно их использовать. Настройка прав короче.
        const customsIdWithDeffience = ["acceptBug", "denyBug", "deleteBug"];
        const rolesIdAllowUseCustomsIdHead = [
            rolesId.discordMaster,
            rolesId.juniorDiscordMaster,
            rolesId.adviceAdministration
        ]
        if (customsIdWithDeffience.includes(interaction.customId)) {
            if (!interaction.member.roles.cache.find((role) => rolesIdAllowUseCustomsIdHead.includes(role.id))) {
                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`❌ | Ошибка!`)
                            .setDescription(`**У Вас не хватает прав!**`)
                            .setColor(Colors.Red)
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
        }
        if (action) {
            await action.func({
                bot,
                interaction,
                member: interaction.member,
                guild,
                rolesId,
                channelsId,
                categoriesId,
            })
        }
    },
};
