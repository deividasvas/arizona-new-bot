const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const getModerInfo = require("../../components/getModerInfo");
const setWarnsOrRebukes = require("../../components/setWarnsOrRebukes");
const log = require("../../components/log");

module.exports = {
    name: "unmwarn", // название команды
    descr: "Снять предупреждение модератору", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Модератор с которого будет снято предупреждение",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "причина",
            description: "Причина по которой модератору будет снято предупреждение",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ], // аргументы
    perms: (rolesId) => {
        return [
            rolesId.discordMaster,
            rolesId.juniorDiscordMaster,
            rolesId.adviceAdministration,
            rolesId.curatorModeration,
        ];
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args, rolesId, channelsId}) => {
        const moderator = guild.members.cache.get(args[0]) || await guild.members.fetch(args[0]);
        const reason = args[1];
        const {
            error,
            warns: listWarnsAndRebukes,
        } = await getModerInfo(bot, guild.id, moderator.id);

        if (error === "THE_NOT_MODERATOR") {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**${moderator} не является модератором. Если это не так, то обратитесь к <@&${rolesId.techSection}>**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }

        const punishModeratorsLogChannel = guild.channels.cache.get(
            channelsId.punishModeratorsLog
        );

        const warns = listWarnsAndRebukes.filter(
            (warnOrRebuke) => warnOrRebuke.group === "warn"
        );

        if (warns.length === 0) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**У модератора ${moderator} нет предупреждений**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }
        await setWarnsOrRebukes(moderator.id, guild.id, ({warns: warnOrRebukes}) => {
            const newWarns = warns.slice(1); // 0 предупреждение убирается, потому, что, счёт идёт с 1
            const newRebukes = warnOrRebukes.filter(warnOrRebuke => warnOrRebuke.group === 'group');
            return [...newRebukes, ...newWarns];
        })

        log(9, {
            guildId: guild.id, // ID сервера
            discordId: moderator.id, // ID упомянутого участника
            discordTag: moderator.user.tag, // Tag упомянутого участника
            discordNick: moderator.displayName, // Серверный ник упомянутого участника
            moderatorId: author.id, // ID автора сообщения
            moderatorTag: author.user.tag, // Tag автора сообщения
            moderatorNick: author.displayName, // Серверный ник автора сообщения
            reason,
        })

        punishModeratorsLogChannel.send({
            content: `${author} ${moderator}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Снятие предупреждения!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Снял: <@${author.id}>\n「🤑」Кому: <@${moderator.id}>\n「📕」Причина: \`${reason}\`\n**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Снятие предупреждения!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно сняли предупреждение модератору ${moderator}. Причина: \`${reason}\`**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ]
        })
    }

};
