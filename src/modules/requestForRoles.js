const {
    rolesId: _rolesId,
    channelsId: _channelsId,
    categories: _categories, rates,
} = require("../configs/settings");
const getAllRolesIdState = require("../components/getAllRolesIdState");
const {EmbedBuilder, Colors, ActionRowBuilder, ButtonStyle, ButtonBuilder, Collection} = require("discord.js");
const getAllRolesIdAdmins = require("../components/getAllRolesIdAdmins");
const getAllRolesIdModers = require("../components/getAllRolesIdModers");
const parseIdFromMention = require("../components/parseIdFromMention");
const setModerInfoParam = require("../components/setModerInfoParam");

const getFractionTagAndRoleIdByNickname = (bot, nickname, tags) => {
    for (const tag of Object.keys(tags)) {
        const tagRoleId = tags[tag];
        if (nickname.includes(`[${tag}]`)) {
            return {
                tag,
                roleId: tagRoleId
            }
        }
        ;
    }
    return null;
}

// Коллекция с игроками у которых КД запроса ролей. Идёт 30 минут.
const createRequestForRole = new Collection();
setInterval(() => {
    // Каждые 5 секунд перебираем список людей у которых есть действующее КД.
    // Если прошли 30 минут КД, то удаляем человека из списка.
    createRequestForRole.map(((dateStart, userId) => {
        const minutes = ((new Date()).getTime() - (new Date(dateStart)).getTime()) / 60000;
        if (minutes >= 30) {
            return createRequestForRole.delete(userId);
        }
    }));
}, 5000);

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы обрабатывать запросы ролей.
    */
    name: "requestForRoles", // имя модуля
    acceptCustomsId: [
        "addRolesRequest",
        "removeRolesRequest",
        "addOrRemoveRoleX",
        "requestGiveRole",
        "requestDenyRole",
        "requestCheckRole",
        "requestDelete"
    ], // модуль автоматически принимает эти айдишники interaction.customId
    async removeRolesRequest({ bot, guild, member, rolesId, interaction }){
        const allStateRolesId = getAllRolesIdState(rolesId);
        member.roles.remove(allStateRolesId);
        interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Снятие ролей!")
                    .setDescription(
                        `**Вы успешно сняли с себя все роли организации!**`
                    )
                    .setColor(Colors.DarkGreen)
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
    async addOrRemoveRoleX({ bot, interaction, member, rolesId, guild }){
        if(member.roles.cache.has(rolesId.x)){
            member.roles.remove(rolesId.x);
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle("📌 | Снятие ролей!")
                        .setDescription(
                            `**Вы успешно сняли с себя роль <@&${rolesId.x}>!**`
                        )
                        .setColor(Colors.DarkGreen)
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
        }

        member.roles.add(rolesId.x);
        return interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Выдача ролей!")
                    .setDescription(
                        `**Вы успешно выдали себе роль <@&${rolesId.x}>!**`
                    )
                    .setColor(Colors.DarkGreen)
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
    async addRolesRequest({interaction, bot, member, rolesId, guild, channelsId}) {
        if (createRequestForRole.has(member.id)) {
            // Количество секунд через сколько можно будет написать новый тикет.
            const dateEnd = new Date(createRequestForRole.get(member.id));
            const minutes = Math.round((dateEnd - new Date()) / 60000);

            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`⏳ | Стой-стой!`)
                        .setDescription(`**Полегче друг, у тебя действует интервал на запрос ролей. По новой запросить роль ты сможешь через \`${minutes}\` минут(у)**`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        // Список ролей имея которые нельзя запрашивать роль.
        const allRolesState = [
            // Министры
            rolesId.ministers,
            // Лидеры
            rolesId.leadersFractions,
            // Заместители
            rolesId.deputiesFractions,
            // Все роли гос.организации
            ...getAllRolesIdState(rolesId),
            // Все админские роли
            ...getAllRolesIdAdmins(rolesId),
        ];
        // Если у пользователя есть одна из ролей, то отдаём ему ошибку.
        if (member.roles.cache.find(role => allRolesState.includes(role.id))) {
            const dontAllowRole = member.roles.cache.find(role => allRolesState.includes(role.id))
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Вам запрещено запрашивать роль организации, так как у Вас имеется роль ${dontAllowRole}. Для начала снимите её, а потом повторите попытку.**`
                        )
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                        .setColor(Colors.Red)
                ]
            })
        }

        // Выражение для проверки тега. Валиден только [tag][rank] Nick_Name.
        const regex = /^\[\w+\]\[\d\].+$/;
        // Проверяем, валидна ли у человека форма тега.
        const nickname = member.displayName.split("").filter(simbol => simbol !== " ").join("");
        if (!regex.test(nickname)) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**У Вас указана невалидная форма. Форма: \`[Фракция][ранг] Имя_Фамилия\`**`
                        )
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                        .setColor(Colors.Red)
                ]
            })
        }

        // Проверяем, есть ли у человека тег по какую-то роль
        const tags = bot.tagsFractions(rolesId);
        const tagInfo = getFractionTagAndRoleIdByNickname(bot, nickname, tags);
        if (!tagInfo) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**На Ваш тег не нашлось определённой роли! Перепроверьте Ваш тег с тегом в канале <#${channelsId.tagsFractions}>**`
                        )
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                        .setColor(Colors.Red)
                ]
            })
        }

        const channelRequestsRoles = guild.channels.cache.get(channelsId.requestsForGiveRole);
        await channelRequestsRoles.send({
            content: `<@&${rolesId.juniorModerator}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("📨 | Новый запрос роли!")
                    .addFields([
                        {
                            name: `Пользователь`,
                            value: `<@${interaction.member.id}>`,
                            inline: true,
                        },
                        {
                            name: `Никнейм`,
                            value: `\`${interaction.member.displayName}\``,
                            inline: true,
                        },
                        {
                            name: `Роль для выдачи`,
                            value: `<@&${tagInfo.roleId}>`,
                            inline: true,
                        },
                        {
                            name: `Отправлено с канала`,
                            value: `<#${interaction.channel.id}>`,
                            inline: true,
                        },
                        {
                            name: `Информация по выдаче`,
                            value: `\`[✅] - выдать роль\`\n\`[❌] - отказать в выдачи роли\`\n\`[⚙️] - проверить организацию\`\n\`[🗑️] - удалить сообщение\``,
                            inline: true
                        }
                    ])
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setCustomId(`requestGiveRole`)
                            .setEmoji({
                                name: `✅`
                            }),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`requestDenyRole`)
                            .setEmoji({
                                name: `⛔`
                            }),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`requestCheckRole`)
                            .setEmoji({
                                name: `⚙`
                            }),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId(`requestDelete`)
                            .setEmoji({
                                name: `🗑️`
                            })
                    ]),
            ]
        })

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle("📨 | Новый запрос роли!")
                    .setColor(Colors.DarkGreen)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
                    .setDescription(`**Ваш запрос на выдачу роли <@&${tagInfo.roleId}> был успешно отправлен! Ожидайте выдачи от модераторов!**`)
            ]
        })

        const dateEnd = new Date();
        dateEnd.setMinutes(dateEnd.getMinutes() + 30);
        createRequestForRole.set(member.id, dateEnd);
    },

    async requestGiveRole({interaction, bot, guild, rolesId, member}) {
        const {message} = interaction;
        const userId = parseIdFromMention(message.embeds[0].data.fields[0].value);
        let userForGiveRole = guild.members.cache.get(userId);

        // Прежде чем выдать основную роль гос.организации - снимаем все остальные
        // чтобы не произошёл парадокс с 2мя и более ролями гос.организации.
        await userForGiveRole.roles.remove(getAllRolesIdState(rolesId));

        // Роль которую мы будем выдавать
        const roleId = parseIdFromMention(message.embeds[0].fields[2].value);

        // Выдаем необходимую роль + роль сотрудник гос.организации
        await userForGiveRole.roles.add([roleId, rolesId.stateEmployee]);
        message.delete();
        interaction.channel.send({content: `\`[✅ | Одобрение]\` <@${member.id}> \`одобрил запрос от \`${userForGiveRole} \`(${userForGiveRole.id}) на выдачу роли \`<@&${roleId}>\`, с никнеймом ${userForGiveRole.displayName}\``});
    },
    async run({interaction, bot}) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        const guild = bot.guilds.cache.get(interaction.guildId);
        const member = interaction.member;
        const rolesId = _rolesId[guild.id];
        const channelsId = _channelsId[guild.id];
        const categoriesId = _categories[guild.id];
        // Права к кнопкам в канале request-for-roles.
        const perms = getAllRolesIdModers(rolesId);
        const actions = [
            {
                customId: "removeRolesRequest",
                func: this.removeRolesRequest
            },
            {
                customId: "addOrRemoveRoleX",
                func: this.addOrRemoveRoleX,
            },
            {
                customId: "addRolesRequest",
                func: this.addRolesRequest,
            },
            {
                customId: `requestGiveRole`,
                func: this.requestGiveRole,
                perms,
            }
        ]

        const action = actions.find(action => action.customId === interaction.customId);
        if (action.perms?.length) {
            const rolePerm = action.perms.find(roleId => member.roles.cache.has(roleId));
            if (!rolePerm) {
                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`❌ | Ошибка!`)
                            .setDescription(
                                `**Не достаточно прав!**`
                            )
                            .setAuthor({
                                name: guild.name,
                                iconURL: guild.iconURL(),
                            })
                            .setFooter({
                                text: `Robo Hamster`,
                                iconURL: bot.user.displayAvatarURL(),
                            })
                            .setColor(Colors.Red)
                    ]
                })
            }
        }
        if (action) {
            await action.func({
                bot,
                guild,
                member,
                rolesId,
                channelsId,
                categoriesId,
                interaction,
            });

            // Все кастомные айдишники за которые пополняется параметр `roles` в статистике модератора.
            const customIdUpdatesRolesParam = ["requestGiveRole", "requestDenyRole", "requestCheckRole", "requestDelete"];
            if (customIdUpdatesRolesParam.includes(interaction.customId)) {
                await setModerInfoParam(member.id, guild.id, 'main', 'roles', ({ roles }) => roles + 1)
                await setModerInfoParam(member.id, guild.id, 'week', 'roles', ({ roles }) => roles + 1)
                await setModerInfoParam(member.id, guild.id, 'main', 'balls', ({ coefficient, balls }) => balls + coefficient * rates.role)
                await setModerInfoParam(member.id, guild.id, 'week', 'balls', ({ coefficient, balls }) => balls + coefficient * rates.role)
            }
        }
    },
};
