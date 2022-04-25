const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllrolesIdModers = require("../../components/getAllRolesIdModers");
const sendUserMessage = require("../../components/sendUserMessage");
const unmute = require("../../components/unmute");
const {rolesId, channelsId} = require("../../configs/settings");
const getModerInfo = require("../../components/getModerInfo");
const setWarnsOrRebukes = require("../../components/setWarnsOrRebukes");

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
    perms: () => {
        return [
            rolesId.discordMaster,
            rolesId.juniorDiscordMaster,
            rolesId.adviceAdministration,
            rolesId.curatorModeration,
        ];
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args}) => {
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
        await setWarnsOrRebukes(moderator.id, guild.id, ({warns: warnOrRebukes}) => {
            const newWarns = warns.slice(1); // 0 предупреждение убирается, потому, что, счёт идёт с 1
            const newRebukes = warnOrRebukes.filter(warnOrRebuke => warnOrRebuke.group === 'group');
            return [...newRebukes, ...newWarns];
        })

        punishModeratorsLogChannel.send({
            content: `${author} ${moderator}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
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
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
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
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ]
        })
    }

};
