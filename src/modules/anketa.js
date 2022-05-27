const {EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const getAllRolesIDAdmins = require("../components/getAllRolesIdAdmins");
const {channelsId, rolesId} = require("../configs/settings");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для обработки анкет.
    */
    autoRun: false, // автоматический запуск модуля
    name: "anketa", // имя модуля
    acceptCustomsId: ["anketa-accept", "anketa-deny", "anketa-delete"], // модуль автоматически принимает эти айдишники interaction.customId
    // Айди ролей которые могут взаимодействовать с ролями
    rolesIdAllow: (rolesId) => [
        rolesId.mainSpectatorsState,
        rolesId.spectatorState,
        rolesId.star,
    ],
    // Функция отправки анкеты
    async sendQuestionnaire({bot, guild, message}) {
        // канал куда будут отправляться анкеты которые на рассмотрений
        const guildChannelsId = channelsId[guild.id];
        const channelQuestionnaire = guild.channels.cache.get(guildChannelsId.questionnairesForCheck);
        const row = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId("anketa-accept")
                .setEmoji({
                    name: "✅"
                })
                .setStyle(ButtonStyle.Success)
                .setLabel("Одобрить"),
            new ButtonBuilder()
                .setCustomId("anketa-deny")
                .setEmoji({
                    name: "⛔"
                })
                .setStyle(ButtonStyle.Danger)
                .setLabel("Отказать"),
            new ButtonBuilder()
                .setCustomId("anketa-delete")
                .setEmoji({
                    name: "🇩"
                })
                .setStyle(ButtonStyle.Primary)
                .setLabel("Удалить")
        ]);
        channelQuestionnaire.send({
            content: `Запросил: ${message.author}`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Новая анкета!!")
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**\`${message.content}\`**`
                    )
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ],
            components: [row]
        })
    },
    // Функция одобрения анкеты.
    async acceptQuestionnaire({bot, guild, interaction}) {
        const acceptedQuestionnaireChannel = guild.channels.cache.get(channelsId[guild.id].acceptedQuestionnaire);
        acceptedQuestionnaireChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle("✅ | Анкета одобрена!")
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(`>>> **${interaction.message.embeds[0].description.split('`')[1]}**`)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
                    .addFields([
                        {
                            name: `Одобрил`,
                            value: `${interaction.member}`
                        }
                    ])
                    .setThumbnail(guild.iconURL())
            ],
            content: `${interaction.message.content.split(":")[1]}`
        });
        interaction.message.delete();
        interaction.deleteReply();
    },
    // Функция отказа анкеты.
    async denyQuestionnaire({bot, interaction, guild}) {
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle("⏰ | Необходимо Ваш ответ!")
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(`**Введите причину отказа. У Вас одна минута!**`)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })

            ]
        });
        const messages = await interaction.message.channel.awaitMessages({
            filter: (i) => i.author.id === interaction.member.id,
            max: 1,
            time: 60000,
        });
        if (!messages.size) {
            return;
        }
        const answer = messages.first();
        await answer.delete();
        const deniedQuestionnaireChannel = guild.channels.cache.get(channelsId[guild.id].dontAcceptedQuestionnaire);
        deniedQuestionnaireChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkRed)
                    .setTitle("⛔ | Анкета отказана!")
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(`>>> **${interaction.message.embeds[0].description.split('`')[1]}**`)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
                    .addFields([
                        {
                            name: `Отказал`,
                            value: `${interaction.member}`
                        },
                        {
                            name: `Причина`,
                            value: `${answer.content}`
                        }
                    ])
                    .setThumbnail(guild.iconURL())
            ],
            content: `${interaction.message.content.split(":")[1]}`
        });
        interaction.message.delete();
    },
    // Функция отказа анкеты.
    async deleteQuestionnaire({bot, interaction, guild}) {
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle("⏰ | Необходимо Ваш ответ!")
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(`**Введите причину удаления. У Вас одна минута!**`)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })

            ]
        });
        const messages = await interaction.message.channel.awaitMessages({
            filter: (i) => i.author.id === interaction.member.id,
            max: 1,
            time: 60000,
        });
        if (!messages.size) {
            return;
        }
        const answer = messages.first();
        await answer.delete();
        const deniedQuestionnaireChannel = guild.channels.cache.get(channelsId[guild.id].dontAcceptedQuestionnaire);
        deniedQuestionnaireChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle("🇩 | Анкета удалена!")
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(`>>> **${interaction.message.embeds[0].description.split('`')[1]}**`)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
                    .addFields([
                        {
                            name: `Удалил`,
                            value: `${interaction.member}`
                        },
                        {
                            name: `Причина`,
                            value: `${answer.content}`
                        }
                    ])
                    .setThumbnail(guild.iconURL())
            ],
            content: `${interaction.message.content.split(":")[1]}`
        });
        interaction.message.delete();
    },
    async run({bot, message, interaction}) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        const guild = message.guild || bot.guilds.cache.get(interaction.guildId);
        const rolesIdAllow = this.rolesIdAllow(rolesId[guild.id]);
        if (message.channel.id === channelsId[guild.id].sendQuestionnaire) {
            await message.delete();
            return this.sendQuestionnaire({bot, guild, message});
        }
        if (!interaction.member.roles.cache.some(role => rolesIdAllow.includes(role.id))) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**У Вас нет доступа к данной функции.**`)
                        .setColor(Colors.Blue)
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

        switch (interaction.customId) {
            case "anketa-accept": {
                return this.acceptQuestionnaire({bot, guild, interaction});
            }
            case "anketa-deny": {
                return this.denyQuestionnaire({bot, guild, interaction})
            }
            case "anketa-delete": {
                return this.deleteQuestionnaire({bot, guild, interaction})
            }
        }
    },
};
