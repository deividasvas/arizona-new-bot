const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const getModerInfo = require("../../components/getModerInfo");
const setWarnsOrRebukes = require("../../components/setWarnsOrRebukes");

module.exports = {
    name: "unmrebuke", // название команды
    descr: "Снять выговор модератору", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Модератор с которого будет снят выговор",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "причина",
            description: "Причина по которой модератору будет снят выговор",
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

    run: async ({bot, interaction, author, guild, args, channelsId, rolesId}) => {
        const moderator = guild.members.cache.get(args[0]) || await guild.members.fetch(args[0]);
        const reason = args[1];
        const {
            error,
            warns: listWarnsAndRebukes,
            main,
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
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }
        const punishModeratorsLogChannel = guild.channels.cache.get(
            channelsId.punishModeratorsLog
        );

        const rebukes = listWarnsAndRebukes.filter(
            (warnOrRebuke) => warnOrRebuke.group === "rebuke"
        );

        if (rebukes.length === 0) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**У модератора ${moderator} нет выговоров**`
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
        await setWarnsOrRebukes(moderator.id, guild.id, ({warns}) => {
            const newRebukes = rebukes.slice(1); // 0 выговор убирается, потому, что, счёт идёт с 1
            const newWarns = warns.filter(warnOrRebuke => warnOrRebuke.group === 'warn');
            return [...newRebukes, ...newWarns];
        })

        punishModeratorsLogChannel.send({
            content: `${author} ${moderator}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Снятие выговора!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Снял: <@${author.id}>\n「🤑」Кому: <@${moderator.id}>\n「📕」Причина: \`${reason}\`\n**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Снятие выговора!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно сняли выговор модератору ${moderator}. Причина: \`${reason}\`**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ]
        })
    }

};
