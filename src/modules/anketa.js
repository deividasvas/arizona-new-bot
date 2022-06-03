const {EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const getAllRolesIDAdmins = require("../components/getAllRolesIdAdmins");
const {getGuildChannelsId, getGuildRolesId} = require("../configs/settings");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для обработки анкет.
    */
    autoRun: false, // автоматический запуск модуля
    name: "anketa", // имя модуля
    acceptCustomsId: ["anketaAccept", "anketaDeny", "anketaDelete"], // модуль автоматически принимает эти айдишники interaction.customId
    // Айди ролей которые могут взаимодействовать с анкетами
    rolesIdAllow: (rolesId) => [
        rolesId.mainSpectatorsState, // руководство гос
        rolesId.spectatorState, // следящий гос
        rolesId.star, // звездочка роль
    ],
    // Функция отправки анкеты
    async sendQuestionnaire({bot, guild, message}) {
        // канал куда будут отправляться анкеты которые на рассмотрений
        const guildChannelsId = channelsId[guild.id];
        const channelQuestionnaire = guild.channels.cache.get(guildChannelsId.questionnairesForCheck);
        const row = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId("anketaAccept")
                .setEmoji({
                    name: "✅"
                })
                .setStyle(ButtonStyle.Success)
                .setLabel("Одобрить"),
            new ButtonBuilder()
                .setCustomId("anketaDeny")
                .setEmoji({
                    name: "⛔"
                })
                .setStyle(ButtonStyle.Danger)
                .setLabel("Отказать"),
            new ButtonBuilder()
                .setCustomId("anketaDelete")
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
        // Сервер на котором идёт взаимодействие с анкетой.
        const guild = message.guild || bot.guilds.cache.get(interaction.guildId);
        // Все айди ролей на сервере.
        const rolesId = getGuildRolesId(guild.id);
        // Все айди каналов на сервере.
        const channelsId = getGuildChannelsId(guild.id);

        // Айди ролей которым разрешено пользоваться функциями данного модуля.
        const rolesIdAllow = this.rolesIdAllow(rolesId);
        // Если этот канал это отправка анкет, то удаляем сообщение и перенаправляем его в обработчик отправки анкет.
        if (message.channel.id === channelsId.sendQuestionnaire) {
            await message.delete();
            return this.sendQuestionnaire({bot, guild, message});
        }

        // Если у пользователя нет ролей для взаимодействия с одобрением/отказом/удалением анкет, то выдаём ему ошибку
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

        // Обработчики под их айдишники
        switch (interaction.customId) {
            case "anketaAccept": {
                return this.acceptQuestionnaire({bot, guild, interaction});
            }
            case "anketaDeny": {
                return this.denyQuestionnaire({bot, guild, interaction})
            }
            case "anketaDelete": {
                return this.deleteQuestionnaire({bot, guild, interaction})
            }
        }
    },
};
