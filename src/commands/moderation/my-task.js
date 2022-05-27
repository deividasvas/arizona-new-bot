const {
    EmbedBuilder, Colors, ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const setWarnsOrRebukes = require("../../components/setWarnsOrRebukes");
const updateModeratorTask = require("../../components/updateModeratorTask");

module.exports = {
    name: "my-task", // название команды
    descr: "Узнать своё задание для снятия предупреждения", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [{
        name: "пользователь",
        description: "Модератор у которого Вы хотите узнать задание для снятия предупреждения",
        type: ApplicationCommandOptionType.User,
        required: false,
    },], // аргументы
    perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args, rolesId, channelsId}) => {
        const rolesAllowListForCheckOther = [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration, rolesId.curatorModeration,]; // роли которым можно просматривать чужие статистики наказаний
        if (args[0] && !author.roles.cache.some((role) => rolesAllowListForCheckOther.includes(role.id))) {
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**Просмотр чужих заданий возможно минимально от должности <@&${rolesAllowListForCheckOther[rolesAllowListForCheckOther.length - 1]}>**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }

        const moderator = args[0] ? guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0])) : author;
        const {
            warns: warnsOrRebukes,
            task,
            error,
        } = await getModerInfo(bot, guild.id, moderator.id);

        if (error === "THE_NOT_MODERATOR") {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**${
                                args[0] ? `Пользователь ${moderator} не является` : "Вы не являетесь"
                            } модератором. Если это не так, то обратитесь к <@&${
                                rolesId.techSection
                            }>**`
                        )
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

        const warns = warnsOrRebukes.filter((warnOrRebuke) => warnOrRebuke.group === "warn"); // все предупреждения
        if (!warns.length) {
            if (!args[0]) {
                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        await new EmbedBuilder()
                            .setTitle(`❌ | Ошибка!`)
                            .setDescription(`**Вы не имеете предупреждений**`)
                            .setColor(Colors.Blue)
                            .setAuthor({
                                name: guild.name, iconURL: guild.iconURL(),
                            })
                            .setFooter({
                                text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                            }),],
                });
            }

            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Модератор не имеет предупреждений**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                        }),],
            });
        }

        if (task.status === 'no') {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Задание не выдано. Обратитесь к кураторам модерации и выше**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                        }),],
            });
        }

        if (task.mutes === 0 && task.bans === 0 && task.kicks === 0 && task.tickets === 0) {
            const punishModeratorsLogChannel = guild.channels.cache.get(channelsId.punishModeratorsLog);
            await setWarnsOrRebukes(moderator.id, guild.id, ({warns: warnOrRebukes}) => {
                const newWarns = warns.slice(1); // откидываем один пред
                const newRebukes = warnOrRebukes.filter(warnOrRebuke => warnOrRebuke.group === 'group');
                return [...newRebukes, ...newWarns];
            })

            await updateModeratorTask(author.id, guild.id, {
                status: 'no'
            });

            const warn = warns[0]; // пред который был снят.

            punishModeratorsLogChannel.send({
                content: `<@${warn.initiatorId}> <@${author.id}>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(`📌 | Снятие предупреждения!`)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдавал: <@${warn.initiatorId}>\n「🤑」Кому: <@${author.id}>\n「📕」Причина: \`Выполнение задания\`\n**`
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(
                            `📌 | Снятие предупреждения!`
                        )
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**Поздравляем! Вы выполнили задание на снятие предупреждение и предупреждение было успешно снято!**`
                        )
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(
                        `📌 | Для снятия предупреждения нужно:`
                    )
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `>>> **Выдать \`${task.mutes}\` мутов\nВыдать \`${task.bans}\` банов\nВыдать \`${task.tickets}\` тикетов\nВыдать \`${task.kicks}\` киков**`
                    )
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
    },
};
